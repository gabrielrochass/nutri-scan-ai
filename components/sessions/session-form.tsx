"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MapPin, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createSessionSchema, type CreateSessionInput } from "@/lib/validation";

type FormValues = {
  className: string;
  centerLat: string;
  centerLon: string;
  radiusM: string;
  expiresInMinutes: string;
  createdByLabel: string;
};

export function SessionForm() {
  const router = useRouter();
  const [locating, setLocating] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      className: "",
      centerLat: "",
      centerLon: "",
      radiusM: "50",
      expiresInMinutes: "5",
      createdByLabel: "",
    },
  });

  const { register, handleSubmit, setValue, formState } = form;

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste dispositivo.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("centerLat", pos.coords.latitude.toFixed(6));
        setValue("centerLon", pos.coords.longitude.toFixed(6));
        setLocating(false);
        toast.success("Localização capturada.");
      },
      (err) => {
        setLocating(false);
        toast.error(`Falha ao obter localização: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }

  async function onSubmit(values: FormValues) {
    const input: CreateSessionInput = {
      className: values.className,
      centerLat: Number(values.centerLat),
      centerLon: Number(values.centerLon),
      radiusM: Number(values.radiusM),
      expiresInMinutes: Number(values.expiresInMinutes),
      createdByLabel: values.createdByLabel || undefined,
    };

    const parsed = createSessionSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      toast.error(first ? first.message : "Validação falhou.");
      return;
    }

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? `Erro HTTP ${res.status}`);
      return;
    }
    const json = (await res.json()) as { id: string; token: string };
    router.push(`/sessions/${json.id}?t=${encodeURIComponent(json.token)}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova sessão de presença</CardTitle>
        <CardDescription>
          Defina turma, ponto central da sala, raio em metros e o tempo de
          validade do QR Code.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <Section
            title="Identificação"
            hint="Aparece no painel e no app dos alunos."
          >
            <Field id="className" label="Turma">
              <Input
                id="className"
                placeholder="Tendências em Meios de Interação"
                {...register("className", { required: true })}
              />
            </Field>
            <Field
              id="createdByLabel"
              label="Docente"
              hint="Opcional · ajuda a identificar a sessão no histórico."
            >
              <Input
                id="createdByLabel"
                placeholder="Prof. Fulano"
                {...register("createdByLabel")}
              />
            </Field>
          </Section>

          <Section
            title="Ponto central da sala"
            hint="Use o botão para capturar do GPS do navegador, ou digite manualmente."
          >
            <div className="grid grid-cols-2 gap-3">
              <Field id="centerLat" label="Latitude">
                <Input
                  id="centerLat"
                  inputMode="decimal"
                  placeholder="-8.0476"
                  {...register("centerLat", { required: true })}
                />
              </Field>
              <Field id="centerLon" label="Longitude">
                <Input
                  id="centerLon"
                  inputMode="decimal"
                  placeholder="-34.8770"
                  {...register("centerLon", { required: true })}
                />
              </Field>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={useCurrentLocation}
              disabled={locating}
            >
              {locating ? <Loader2 className="animate-spin" /> : <MapPin />}
              {locating ? "Capturando..." : "Usar minha localização"}
            </Button>
          </Section>

          <Section
            title="Regras de validação"
            hint="Raio máximo aceito pelo geofence e tempo até o QR expirar."
          >
            <div className="grid grid-cols-2 gap-3">
              <Field id="radiusM" label="Raio (m)">
                <Input
                  id="radiusM"
                  type="number"
                  min={5}
                  max={2000}
                  {...register("radiusM", { required: true })}
                />
              </Field>
              <Field id="expiresInMinutes" label="Validade (min)">
                <Input
                  id="expiresInMinutes"
                  type="number"
                  min={1}
                  max={180}
                  {...register("expiresInMinutes", { required: true })}
                />
              </Field>
            </div>
          </Section>

          <Button type="submit" size="lg" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <QrCode />
            )}
            Gerar QR Code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-3 border-l-2 border-border pl-4">
      <div className="grid gap-0.5">
        <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </legend>
        {hint ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      {children}
    </fieldset>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
