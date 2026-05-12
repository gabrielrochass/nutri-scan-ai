import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionSchema } from "@/lib/validation";
import { signToken } from "@/lib/token";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo inválido (JSON)" },
      { status: 400 },
    );
  }

  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validação", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const { token, hash } = signToken();
  const expiresAt = new Date(Date.now() + data.expiresInMinutes * 60_000);

  const session = await prisma.session.create({
    data: {
      className: data.className,
      centerLat: data.centerLat,
      centerLon: data.centerLon,
      radiusM: data.radiusM,
      tokenHash: hash,
      expiresAt,
      createdByLabel: data.createdByLabel,
    },
    select: { id: true, expiresAt: true },
  });

  const origin = new URL(request.url).origin;
  return NextResponse.json(
    {
      id: session.id,
      token,
      attendUrl: `${origin}/attend/${token}`,
      expiresAt: session.expiresAt.toISOString(),
    },
    { status: 201 },
  );
}
