import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { patchSessionSchema } from "@/lib/validation";
import { emitClosed } from "@/lib/sse-bus";
import type { AttendanceDTO, SessionDTO } from "@/lib/dto";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
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
          createdAt: true,
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }

  const dto: SessionDTO = {
    id: session.id,
    className: session.className,
    centerLat: session.centerLat,
    centerLon: session.centerLon,
    radiusM: session.radiusM,
    expiresAt: session.expiresAt.toISOString(),
    closedAt: session.closedAt ? session.closedAt.toISOString() : null,
    createdByLabel: session.createdByLabel,
    attendances: session.attendances.map(
      (a): AttendanceDTO => ({
        id: a.id,
        name: a.name,
        matricula: a.matricula,
        distanceM: a.distanceM,
        createdAt: a.createdAt.toISOString(),
      }),
    ),
  };

  return NextResponse.json(dto);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }
  const parsed = patchSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validação" }, { status: 422 });
  }

  const session = await prisma.session.findUnique({
    where: { id },
    select: { id: true, closedAt: true },
  });
  if (!session) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
  }
  if (session.closedAt) {
    return NextResponse.json({ ok: true, alreadyClosed: true });
  }

  await prisma.session.update({
    where: { id },
    data: { closedAt: new Date() },
  });
  emitClosed(id);

  return NextResponse.json({ ok: true });
}
