import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { attendSubmitSchema } from "@/lib/validation";
import { hashIp, hashToken, verifyToken } from "@/lib/token";
import { haversineMeters } from "@/lib/geo";
import { emitAttendance, emitRejection } from "@/lib/sse-bus";
import type { AttendanceDTO, PublicSessionDTO, RejectedDTO } from "@/lib/dto";

export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

function getClientIp(request: Request): string | null {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return null;
}

async function findSessionByToken(token: string) {
  if (!verifyToken(token)) return null;
  const tokenHash = hashToken(token);
  return prisma.session.findUnique({ where: { tokenHash } });
}

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  const session = await findSessionByToken(token);
  if (!session) {
    return NextResponse.json({ error: "Token inválido" }, { status: 404 });
  }
  const dto: PublicSessionDTO = {
    sessionId: session.id,
    className: session.className,
    expiresAt: session.expiresAt.toISOString(),
    centerLat: session.centerLat,
    centerLon: session.centerLon,
    radiusM: session.radiusM,
    closed: session.closedAt !== null || session.expiresAt.getTime() < Date.now(),
  };
  return NextResponse.json(dto);
}

export async function POST(request: Request, { params }: Params) {
  const { token } = await params;

  if (!verifyToken(token)) {
    return NextResponse.json(
      { status: "rejected", reason: "INVALID_TOKEN" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }
  const parsed = attendSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validação", details: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const data = parsed.data;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!session) {
    return NextResponse.json(
      { status: "rejected", reason: "INVALID_TOKEN" },
      { status: 401 },
    );
  }

  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const clientIp = getClientIp(request);
  const ipHash = clientIp ? hashIp(clientIp) : null;
  const ip = clientIp;

  const now = Date.now();
  if (session.closedAt) {
    const rejection = await prisma.rejectedAttempt.create({
      data: {
        sessionId: session.id,
        reason: "CLOSED",
        name: data.name,
        matricula: data.matricula,
        lat: data.lat,
        lon: data.lon,
        fingerprintHash: data.fingerprintHash,
        userAgent,
      },
    });
    emitRejectionDto(session.id, rejection);
    return NextResponse.json(
      { status: "rejected", reason: "CLOSED" },
      { status: 410 },
    );
  }
  if (session.expiresAt.getTime() < now) {
    const rejection = await prisma.rejectedAttempt.create({
      data: {
        sessionId: session.id,
        reason: "EXPIRED",
        name: data.name,
        matricula: data.matricula,
        lat: data.lat,
        lon: data.lon,
        fingerprintHash: data.fingerprintHash,
        userAgent,
      },
    });
    emitRejectionDto(session.id, rejection);
    return NextResponse.json(
      { status: "rejected", reason: "EXPIRED" },
      { status: 410 },
    );
  }

  const distanceM = haversineMeters(
    { lat: data.lat, lon: data.lon },
    { lat: session.centerLat, lon: session.centerLon },
  );

  if (distanceM > session.radiusM) {
    const rejection = await prisma.rejectedAttempt.create({
      data: {
        sessionId: session.id,
        reason: "OUT_OF_RANGE",
        name: data.name,
        matricula: data.matricula,
        lat: data.lat,
        lon: data.lon,
        distanceM,
        fingerprintHash: data.fingerprintHash,
        userAgent,
      },
    });
    emitRejectionDto(session.id, rejection);
    return NextResponse.json(
      { status: "rejected", reason: "OUT_OF_RANGE", distanceM },
      { status: 422 },
    );
  }

  try {
    const created = await prisma.attendanceRecord.create({
      data: {
        sessionId: session.id,
        name: data.name,
        matricula: data.matricula,
        lat: data.lat,
        lon: data.lon,
        accuracyM: data.accuracyM,
        distanceM,
        fingerprintHash: data.fingerprintHash,
        userAgent,
        ip,
        ipHash,
      },
      select: {
        id: true,
        name: true,
        matricula: true,
        distanceM: true,
        createdAt: true,
      },
    });

    const dto: AttendanceDTO = {
      id: created.id,
      name: created.name,
      matricula: created.matricula,
      distanceM: created.distanceM,
      createdAt: created.createdAt.toISOString(),
    };
    emitAttendance(session.id, dto);

    return NextResponse.json(
      { status: "ok", id: created.id, distanceM },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta?.target as string[] | string | undefined) ?? "";
      const targetStr = Array.isArray(target) ? target.join(",") : String(target);
      const reason = targetStr.includes("fingerprintHash")
        ? "DUPLICATE_FINGERPRINT"
        : "DUPLICATE_MATRICULA";
      const rejection = await prisma.rejectedAttempt.create({
        data: {
          sessionId: session.id,
          reason,
          name: data.name,
          matricula: data.matricula,
          lat: data.lat,
          lon: data.lon,
          distanceM,
          fingerprintHash: data.fingerprintHash,
          userAgent,
        },
      });
      emitRejectionDto(session.id, rejection);
      return NextResponse.json(
        { status: "rejected", reason },
        { status: 409 },
      );
    }
    throw err;
  }
}

function emitRejectionDto(
  sessionId: string,
  rejection: {
    id: string;
    reason: string;
    name: string | null;
    matricula: string | null;
    distanceM: number | null;
    createdAt: Date;
  },
) {
  const dto: RejectedDTO = {
    id: rejection.id,
    reason: rejection.reason,
    name: rejection.name,
    matricula: rejection.matricula,
    distanceM: rejection.distanceM,
    createdAt: rejection.createdAt.toISOString(),
  };
  emitRejection(sessionId, dto);
}
