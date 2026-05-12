import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { SessionForm } from "@/components/sessions/session-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NewSessionPage() {
  return (
    <main className="container mx-auto max-w-2xl flex-1 px-4 py-8 sm:py-12">
      <div className="grid gap-4 pb-6">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-fit",
          )}
        >
          <ChevronLeft /> Voltar ao painel
        </Link>
        <div className="grid gap-2">
          <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wider">
            Etapa 1 de 1
          </Badge>
          <h1 className="font-heading text-2xl tracking-tight sm:text-3xl">
            Configurar nova sessão
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Defina a turma, o ponto central da sala e as regras de validação. O
            QR Code é gerado em seguida e pode ser projetado para os alunos
            escanearem.
          </p>
        </div>
      </div>
      <SessionForm />
    </main>
  );
}
