"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  sessionId: string;
  alreadyClosed: boolean;
};

export function CloseSessionButton({ sessionId, alreadyClosed }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  if (alreadyClosed) {
    return (
      <Button variant="ghost" disabled>
        <XCircle /> Sessão encerrada
      </Button>
    );
  }

  async function confirm() {
    setPending(true);
    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ close: true }),
    });
    setPending(false);
    if (!res.ok) {
      toast.error("Falha ao encerrar.");
      return;
    }
    toast.success("Sessão encerrada.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive">
            <XCircle /> Encerrar sessão
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Encerrar sessão?</DialogTitle>
          <DialogDescription>
            Após encerrar, novos registros serão rejeitados. Essa ação não pode
            ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            Encerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
