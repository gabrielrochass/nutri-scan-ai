"use client";

import { ShieldCheck } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Props = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function ConsentCard({ checked, onCheckedChange }: Props) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="grid gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Termo de coleta de dados — LGPD
        </span>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Para validar sua presença, esta plataforma realiza uma coleta única
          e episódica dos seguintes dados: coordenadas de geolocalização
          (GPS/Wi-Fi), precisão do sinal, identificador técnico do dispositivo
          (canvas/WebGL/hardware), agente de navegação (user agent) e
          endereço IP de origem. Os dados são utilizados exclusivamente para
          comprovar sua presença nesta sessão e são tratados em conformidade
          com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, art. 6º —
          princípios de necessidade e minimização).
        </p>
      </div>
      <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-2 text-xs">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
        <p className="leading-relaxed text-foreground/80">
          <strong className="font-semibold">
            Um dispositivo, uma presença.
          </strong>{" "}
          A impressão digital deste aparelho será vinculada à sua matrícula.
          Tentativas de marcar presença para outra pessoa no mesmo aparelho
          serão automaticamente bloqueadas e registradas como tentativa de
          fraude.
        </p>
      </div>
      <Label className="items-start gap-2">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(Boolean(v))}
          className="mt-0.5"
        />
        <span className="text-sm leading-tight">
          Li o termo acima, confirmo que este aparelho é de uso pessoal e
          autorizo a coleta dos dados para registro da minha presença.
        </span>
      </Label>
    </div>
  );
}
