import Link from "next/link";
import { Plus, Radar, Users, Clock, MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SessionRow = {
  id: string;
  className: string;
  expiresAt: Date;
  radiusM: number;
  closedAt: Date | null;
  createdAt: Date;
  createdByLabel: string | null;
  _count: { attendances: number };
};

async function getSessions() {
  const now = new Date();
  const [active, history, totals] = await Promise.all([
    prisma.session.findMany({
      where: { expiresAt: { gt: now }, closedAt: null },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        className: true,
        expiresAt: true,
        radiusM: true,
        closedAt: true,
        createdAt: true,
        createdByLabel: true,
        _count: { select: { attendances: true } },
      },
    }),
    prisma.session.findMany({
      where: {
        OR: [{ closedAt: { not: null } }, { expiresAt: { lte: now } }],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        className: true,
        expiresAt: true,
        radiusM: true,
        closedAt: true,
        createdAt: true,
        createdByLabel: true,
        _count: { select: { attendances: true } },
      },
    }),
    prisma.attendanceRecord.count(),
  ]);
  return { active, history, totalAttendances: totals };
}

export default async function HomePage() {
  const { active, history, totalAttendances } = await getSessions();

  return (
    <main className="container mx-auto max-w-6xl flex-1 px-4 py-8 sm:py-12">
      <section className="grid gap-6 pb-10">
        <div className="grid gap-3">
          <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wider">
            Painel do docente
          </Badge>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="grid max-w-2xl gap-2">
              <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">
                Controle de presença com validação espacial
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Cada sessão gera um QR Code único. O aluno só consegue marcar
                presença se estiver dentro do raio configurado da sala, em um
                único dispositivo, antes do código expirar. Ao final, exporte
                os presentes em planilha pronta para o SIGAA.
              </p>
            </div>
            <Link
              href="/sessions/new"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              <Plus /> Abrir nova sessão
            </Link>
          </div>
        </div>

        <Separator />

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metric label="Sessões ativas" value={active.length} accent />
          <Metric label="Sessões registradas" value={active.length + history.length} />
          <Metric label="Presenças contabilizadas" value={totalAttendances} />
          <Metric
            label="Sessões encerradas"
            value={history.length}
            muted
          />
        </dl>
      </section>

      <Tabs defaultValue="active" className="gap-4">
        <TabsList>
          <TabsTrigger value="active">
            <Radar className="size-3.5" />
            Sessões ativas
            <Badge variant="secondary" className="ml-1">
              {active.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="size-3.5" />
            Histórico
            <Badge variant="outline" className="ml-1">
              {history.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <SessionGrid
            sessions={active}
            emptyTitle="Nenhuma sessão em andamento"
            emptyHint="Abra uma nova sessão para gerar o QR Code antes da próxima aula."
            status="active"
          />
        </TabsContent>

        <TabsContent value="history">
          <SessionGrid
            sessions={history}
            emptyTitle="Sem registros anteriores"
            emptyHint="Sessões encerradas e expiradas ficam disponíveis aqui para consulta e exportação."
            status="history"
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function Metric({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: number;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4",
        accent && "border-primary/30 bg-primary/5",
        muted && "bg-muted/40",
      )}
    >
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 font-heading text-2xl tracking-tight",
          accent && "text-primary",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function SessionGrid({
  sessions,
  emptyTitle,
  emptyHint,
  status,
}: {
  sessions: SessionRow[];
  emptyTitle: string;
  emptyHint: string;
  status: "active" | "history";
}) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="grid place-items-center gap-2 py-14 text-center">
          <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
            {status === "active" ? (
              <Radar className="size-4" />
            ) : (
              <Clock className="size-4" />
            )}
          </div>
          <p className="text-lg font-medium">{emptyTitle}</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {emptyHint}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sessions.map((s) => (
        <SessionCard key={s.id} session={s} status={status} />
      ))}
    </div>
  );
}

function SessionCard({
  session,
  status,
}: {
  session: SessionRow;
  status: "active" | "history";
}) {
  const closed = session.closedAt !== null;
  // eslint-disable-next-line react-hooks/purity -- async RSC, runs once per request
  const expired = !closed && session.expiresAt.getTime() < Date.now();

  const stateBadge = closed
    ? { label: "Encerrada", variant: "destructive" as const }
    : expired
      ? { label: "Expirada", variant: "outline" as const }
      : { label: "Em andamento", variant: "secondary" as const };

  return (
    <Link href={`/sessions/${session.id}`} className="group block">
      <Card className="h-full transition-all hover:border-primary/30 hover:shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
              {session.className}
            </CardTitle>
            <Badge variant={stateBadge.variant}>{stateBadge.label}</Badge>
          </div>
          <CardDescription className="line-clamp-1">
            {session.createdByLabel ?? "Docente não identificado"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-1.5 text-xs text-muted-foreground">
          <Row icon={<Users className="size-3.5" />}>
            <span className="font-medium text-foreground">
              {session._count.attendances}
            </span>{" "}
            {session._count.attendances === 1 ? "presença" : "presenças"}
          </Row>
          <Row icon={<MapPin className="size-3.5" />}>
            Raio de validação · {session.radiusM} m
          </Row>
          <Row icon={<Clock className="size-3.5" />}>
            {status === "active" ? "Expira em" : "Encerrada em"}{" "}
            {formatDateShort(
              closed ? (session.closedAt as Date) : session.expiresAt,
            )}
          </Row>
        </CardContent>
      </Card>
    </Link>
  );
}

function Row({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function formatDateShort(d: Date): string {
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
