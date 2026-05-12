"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConsentCard } from "./consent-card";
import { ResultCard, type ResultKind } from "./result-card";
import { computeFingerprint } from "@/lib/fingerprint";
import type { PublicSessionDTO } from "@/lib/dto";

type Stage =
  | { kind: "form" }
  | { kind: "locating" }
  | { kind: "submitting"; lat: number; lon: number; accuracyM?: number }
  | { kind: "result"; result: ResultKind };

type Props = {
  token: string;
  session: PublicSessionDTO;
};

export function AttendFlow({ token, session }: Props) {
  const [stage, setStage] = useState<Stage>(() => {
    if (session.closed) return { kind: "result", result: { kind: "CLOSED" } };
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    if (remaining <= 0) return { kind: "result", result: { kind: "EXPIRED" } };
    return { kind: "form" };
  });
  const [name, setName] = useState("");
  const [matricula, setMatricula] = useState("");
  const [consent, setConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    if (remaining <= 0) return;
    const t = setTimeout(() => {
      setStage((s) =>
        s.kind === "result" ? s : { kind: "result", result: { kind: "EXPIRED" } },
      );
    }, remaining);
    return () => clearTimeout(t);
  }, [session.expiresAt]);

  function requestLocation() {
    setErrorMessage(null);
    if (!navigator.geolocation) {
      setStage({ kind: "result", result: { kind: "GEO_DENIED" } });
      return;
    }
    setStage({ kind: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void submit(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStage({ kind: "result", result: { kind: "GEO_DENIED" } });
        } else {
          setStage({
            kind: "result",
            result: { kind: "ERROR", message: `Falha de localização: ${err.message}` },
          });
        }
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }

  async function submit(lat: number, lon: number, accuracyM: number) {
    setStage({ kind: "submitting", lat, lon, accuracyM });
    try {
      const fingerprintHash = await computeFingerprint();
      const res = await fetch(`/api/attend/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          matricula: matricula.trim(),
          lat,
          lon,
          accuracyM,
          fingerprintHash,
          consent: true,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;

      if (res.ok && body.status === "ok") {
        const distanceM = typeof body.distanceM === "number" ? body.distanceM : 0;
        setStage({ kind: "result", result: { kind: "ok", distanceM } });
        return;
      }
      const reason = typeof body.reason === "string" ? body.reason : "ERROR";
      switch (reason) {
        case "OUT_OF_RANGE":
          setStage({
            kind: "result",
            result: {
              kind: "OUT_OF_RANGE",
              distanceM: typeof body.distanceM === "number" ? body.distanceM : 0,
              radiusM: session.radiusM,
            },
          });
          return;
        case "DUPLICATE_FINGERPRINT":
        case "DUPLICATE_MATRICULA":
        case "EXPIRED":
        case "CLOSED":
        case "INVALID_TOKEN":
          setStage({ kind: "result", result: { kind: reason } });
          return;
        default:
          setStage({
            kind: "result",
            result: { kind: "ERROR", message: `HTTP ${res.status}` },
          });
      }
    } catch (err) {
      setStage({
        kind: "result",
        result: {
          kind: "ERROR",
          message: err instanceof Error ? err.message : "Erro desconhecido",
        },
      });
    }
  }

  function canSubmit(): boolean {
    return name.trim().length >= 2 && matricula.trim().length >= 3 && consent;
  }

  if (stage.kind === "result") {
    return (
      <div className="grid gap-4">
        <SessionHeader session={session} />
        <ResultCard result={stage.result} />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <SessionHeader session={session} />
      <Card>
        <CardHeader>
          <CardTitle>Registro de presença</CardTitle>
          <CardDescription>
            Informe seu nome e matrícula, autorize a coleta de dados e libere
            o acesso à localização do dispositivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit()) {
                setErrorMessage("Preencha nome, matrícula e autorize a coleta.");
                return;
              }
              requestLocation();
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={stage.kind !== "form"}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                inputMode="text"
                autoComplete="off"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                disabled={stage.kind !== "form"}
              />
            </div>

            <ConsentCard checked={consent} onCheckedChange={setConsent} />

            {errorMessage ? (
              <p className="text-xs text-destructive">{errorMessage}</p>
            ) : null}

            <Button type="submit" disabled={!canSubmit() || stage.kind !== "form"}>
              {stage.kind === "locating" ? (
                <>
                  <Loader2 className="animate-spin" /> Obtendo localização...
                </>
              ) : stage.kind === "submitting" ? (
                <>
                  <Loader2 className="animate-spin" /> Validando...
                </>
              ) : (
                <>
                  <MapPin /> Marcar presença
                  <Send />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SessionHeader({ session }: { session: PublicSessionDTO }) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="grid gap-0.5">
            <CardTitle className="line-clamp-2">{session.className}</CardTitle>
            <CardDescription className="text-xs">
              Raio {session.radiusM} m · expira às{" "}
              {new Date(session.expiresAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </CardDescription>
          </div>
          <Badge variant={session.closed ? "destructive" : "secondary"}>
            {session.closed ? "Encerrada" : "Ativa"}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}
