import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  ChevronLeft,
  MapPin,
  Hash,
  CalendarClock,
  CheckCircle2,
  Users,
  AlertCircle,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

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
import { SessionQrCard } from "@/components/sessions/session-qr-card";
import { LiveAttendanceList } from "@/components/sessions/live-attendance-list";
import { CloseSessionButton } from "@/components/sessions/close-session-button";
import { Attendance3DMap } from "@/components/sessions/attendance-3d-map";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import type { AttendanceDTO } from "@/lib/dto";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
};

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

function fmt(d: Date): string {
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SessionDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { t: rawToken } = await searchParams;

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      attendances: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          matricula: true,
          distanceM: true,
          lat: true,
          lon: true,
          createdAt: true,
        },
      },
      _count: { select: { rejections: true } },
    },
  });

  if (!session) {
    notFound();
  }

  const attendances: AttendanceDTO[] = session.attendances.map((a) => ({
    id: a.id,
    name: a.name,
    matricula: a.matricula,
    distanceM: a.distanceM,
    lat: a.lat,
    lon: a.lon,
    createdAt: a.createdAt.toISOString(),
  }));

  const explicitlyClosed = session.closedAt !== null;
  // eslint-disable-next-line react-hooks/purity -- async RSC, runs once per request
  const expired = !explicitlyClosed && session.expiresAt.getTime() < Date.now();
  const closed = explicitlyClosed || expired;

  const origin = await getOrigin();
  const attendUrl = !closed && rawToken ? `${origin}/attend/${rawToken}` : null;

  const stateBadge = explicitlyClosed
    ? { label: "Encerrada", variant: "destructive" as const }
    : expired
      ? { label: "Expirada", variant: "outline" as const }
      : { label: "Ativa", variant: "secondary" as const };

  return (
    <main className="container mx-auto max-w-5xl flex-1 px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-6">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ChevronLeft /> Voltar ao painel
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {attendances.length > 0 ? (
            <>
              <a
                href={`/api/sessions/${session.id}/export?format=sigaa`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
                download
                title="Planilha enxuta (4 colunas) pronta para Diário Eletrônico / Lançar Frequência em Planilha"
              >
                <FileSpreadsheet /> Exportar SIGAA
              </a>
              <a
                href={`/api/sessions/${session.id}/export?format=audit`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
                download
                title="Relatório completo com data, hora, distância, coordenadas, IP, user agent e fingerprint"
              >
                <FileText /> Relatório completo
              </a>
            </>
          ) : null}
          {!closed ? (
            <CloseSessionButton sessionId={session.id} alreadyClosed={false} />
          ) : null}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <CardTitle className="text-xl">{session.className}</CardTitle>
              <CardDescription>
                {session.createdByLabel ?? "Sessão sem identificação do docente"}
              </CardDescription>
            </div>
            <Badge variant={stateBadge.variant}>{stateBadge.label}</Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={<Users className="size-4" />}
            label="Presenças"
            value={String(attendances.length)}
          />
          <Stat
            icon={<AlertCircle className="size-4" />}
            label="Rejeitadas"
            value={String(session._count.rejections)}
          />
          <Stat
            icon={<MapPin className="size-4" />}
            label="Geofence"
            value={`${session.radiusM} m`}
            sub={`${session.centerLat.toFixed(4)}, ${session.centerLon.toFixed(4)}`}
          />
          <Stat
            icon={
              explicitlyClosed ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <CalendarClock className="size-4" />
              )
            }
            label={
              explicitlyClosed
                ? "Encerrada em"
                : expired
                  ? "Expirou em"
                  : "Expira em"
            }
            value={fmt(
              explicitlyClosed
                ? (session.closedAt as Date)
                : session.expiresAt,
            )}
          />
        </CardContent>
        <CardContent className="pt-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="size-3" />
            <span className="font-mono">{session.id}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {attendUrl ? (
          <SessionQrCard attendUrl={attendUrl} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>QR Code indisponível</CardTitle>
              <CardDescription>
                {closed
                  ? "Sessão encerrada — não é possível registrar novas presenças."
                  : "O token desta sessão não está nesta URL. Por segurança o servidor não armazena tokens em claro. Crie uma nova sessão para gerar um novo QR Code."}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <LiveAttendanceList
          sessionId={session.id}
          initialAttendances={attendances}
          initiallyClosed={closed}
        />
      </div>

      <div className="mt-6">
        <Attendance3DMap
          sessionId={session.id}
          centerLat={session.centerLat}
          centerLon={session.centerLon}
          radiusM={session.radiusM}
          attendancesWithCoords={attendances.map((a) => ({
            ...a,
            lat: a.lat,
            lon: a.lon,
          }))}
        />
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="grid gap-0.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
      {sub ? (
        <div className="text-xs text-muted-foreground">{sub}</div>
      ) : null}
    </div>
  );
}
