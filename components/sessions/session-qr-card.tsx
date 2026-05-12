"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  attendUrl: string;
};

export function SessionQrCard({ attendUrl }: Props) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(attendUrl);
      toast.success("Link copiado.");
    } catch {
      toast.error("Falha ao copiar.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Código de acesso</CardTitle>
        <CardDescription>
          Projete o QR Code na sala. Cada aluno deve escaneá-lo com o próprio
          dispositivo para registrar presença.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="rounded-lg bg-white p-4 ring-1 ring-foreground/10">
          <QRCodeCanvas value={attendUrl} size={240} includeMargin={false} />
        </div>
        <div className="w-full break-all rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          {attendUrl}
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={copy} className="flex-1">
            <Copy /> Copiar link
          </Button>
          <a
            href={attendUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost" }), "flex-1")}
          >
            <ExternalLink /> Abrir
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
