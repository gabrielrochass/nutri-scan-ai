import { prisma } from "@/lib/prisma";
import {
  slugifyForFilename,
  toAuditCsv,
  toSigaaCsv,
  type AuditRow,
  type SigaaRow,
} from "@/lib/sigaa-csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };
type Format = "sigaa" | "audit";

function parseFormat(value: string | null): Format {
  return value === "audit" ? "audit" : "sigaa";
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const format = parseFormat(new URL(request.url).searchParams.get("format"));

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      attendances: {
        orderBy: [{ matricula: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!session) {
    return new Response("Sessão não encontrada", { status: 404 });
  }

  let csv: string;
  let filenameSuffix: string;

  if (format === "audit") {
    const rows: AuditRow[] = session.attendances.map((a) => ({
      id: a.id,
      matricula: a.matricula,
      name: a.name,
      createdAt: a.createdAt,
      distanceM: a.distanceM,
      accuracyM: a.accuracyM,
      lat: a.lat,
      lon: a.lon,
      ip: a.ip,
      userAgent: a.userAgent,
      fingerprintHash: a.fingerprintHash,
    }));
    csv = toAuditCsv(rows);
    filenameSuffix = "auditoria";
  } else {
    const rows: SigaaRow[] = session.attendances.map((a) => ({
      matricula: a.matricula,
      name: a.name,
      faltas: 0,
    }));
    csv = toSigaaCsv(rows);
    filenameSuffix = "sigaa";
  }

  const filename = `presenca-${slugifyForFilename(session.className)}-${session.id.slice(0, 8)}-${filenameSuffix}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
