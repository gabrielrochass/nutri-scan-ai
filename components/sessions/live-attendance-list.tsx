"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AttendanceDTO, RejectedDTO } from "@/lib/dto";

type Props = {
  sessionId: string;
  initialAttendances: AttendanceDTO[];
  initiallyClosed: boolean;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function LiveAttendanceList({
  sessionId,
  initialAttendances,
  initiallyClosed,
}: Props) {
  const [attendances, setAttendances] = useState<AttendanceDTO[]>(initialAttendances);
  const [recentRejections, setRecentRejections] = useState<RejectedDTO[]>([]);
  const [closed, setClosed] = useState(initiallyClosed);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(`/api/sessions/${sessionId}/stream`);
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.addEventListener("attendance", (ev) => {
      const payload = JSON.parse((ev as MessageEvent).data) as AttendanceDTO;
      setAttendances((prev) => (prev.find((p) => p.id === payload.id) ? prev : [...prev, payload]));
    });
    es.addEventListener("rejection", (ev) => {
      const payload = JSON.parse((ev as MessageEvent).data) as RejectedDTO;
      setRecentRejections((prev) => [payload, ...prev].slice(0, 8));
    });
    es.addEventListener("closed", () => {
      setClosed(true);
    });

    return () => {
      es.close();
    };
  }, [sessionId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="grid gap-1">
            <CardTitle>Lista de presença</CardTitle>
            <CardDescription>
              Registros validados em tempo real conforme os alunos escaneiam o
              QR Code.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={closed ? "destructive" : "secondary"}>
              {closed ? "Encerrada" : "Em andamento"}
            </Badge>
            <Badge variant={connected ? "default" : "outline"}>
              {connected ? "Ao vivo" : "Reconectando…"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Distância</TableHead>
              <TableHead>Horário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aguardando o primeiro registro de presença…
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((a, idx) => (
                <TableRow key={a.id}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.matricula}</TableCell>
                  <TableCell>{a.distanceM.toFixed(1)} m</TableCell>
                  <TableCell>{formatTime(a.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {recentRejections.length > 0 && (
          <div className="grid gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tentativas rejeitadas · últimas {recentRejections.length}
            </div>
            <div className="grid gap-1">
              {recentRejections.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1 text-xs"
                >
                  <span>
                    {r.name ?? "—"}{" "}
                    <span className="text-muted-foreground">{r.matricula ?? ""}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {r.distanceM !== null ? (
                      <span className="text-muted-foreground">
                        {r.distanceM.toFixed(0)} m
                      </span>
                    ) : null}
                    <Badge variant="destructive">{r.reason}</Badge>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
