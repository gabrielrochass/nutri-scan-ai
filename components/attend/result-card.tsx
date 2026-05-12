"use client";

import { CheckCircle2, MapPinOff, ShieldAlert, Ban, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type ResultKind =
  | { kind: "ok"; distanceM: number }
  | { kind: "OUT_OF_RANGE"; distanceM: number; radiusM: number }
  | { kind: "DUPLICATE_FINGERPRINT" }
  | { kind: "DUPLICATE_MATRICULA" }
  | { kind: "EXPIRED" }
  | { kind: "CLOSED" }
  | { kind: "INVALID_TOKEN" }
  | { kind: "GEO_DENIED" }
  | { kind: "ERROR"; message: string };

export function ResultCard({ result }: { result: ResultKind }) {
  switch (result.kind) {
    case "ok":
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-primary" />
              <CardTitle>Presença confirmada</CardTitle>
            </div>
            <CardDescription>
              Distância apurada do ponto de aula: {result.distanceM.toFixed(1)} m.
              O registro foi enviado ao docente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>Validado</Badge>
          </CardContent>
        </Card>
      );
    case "OUT_OF_RANGE":
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPinOff className="text-destructive" />
              <CardTitle>Fora do raio permitido</CardTitle>
            </div>
            <CardDescription>
              Você está a {result.distanceM.toFixed(0)} m da sala (limite: {result.radiusM} m).
              Aproxime-se e tente novamente.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    case "DUPLICATE_FINGERPRINT":
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-destructive" />
              <CardTitle>Dispositivo já utilizado</CardTitle>
            </div>
            <CardDescription>
              Este aparelho já registrou presença nesta sessão com outra
              identidade. Apenas uma matrícula por dispositivo é permitida.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    case "DUPLICATE_MATRICULA":
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-destructive" />
              <CardTitle>Matrícula já registrada</CardTitle>
            </div>
            <CardDescription>
              Esta matrícula já consta como presente nesta aula.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    case "EXPIRED":
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="text-destructive" />
              <CardTitle>QR Code expirado</CardTitle>
            </div>
            <CardDescription>
              Solicite ao docente a geração de um novo QR Code.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    case "CLOSED":
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ban className="text-destructive" />
              <CardTitle>Sessão encerrada</CardTitle>
            </div>
            <CardDescription>
              O docente encerrou esta janela de presença.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    case "INVALID_TOKEN":
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ban className="text-destructive" />
              <CardTitle>Link inválido</CardTitle>
            </div>
            <CardDescription>
              O link foi adulterado ou não corresponde a uma sessão válida.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    case "GEO_DENIED":
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPinOff className="text-destructive" />
              <CardTitle>Permissão de localização negada</CardTitle>
            </div>
            <CardDescription>
              Habilite o acesso à localização nas configurações do navegador e
              recarregue a página.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    case "ERROR":
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-destructive" />
              <CardTitle>Erro inesperado</CardTitle>
            </div>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
        </Card>
      );
  }
}
