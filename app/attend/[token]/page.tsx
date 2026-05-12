import { notFound } from "next/navigation";

import { AttendFlow } from "@/components/attend/attend-flow";
import { prisma } from "@/lib/prisma";
import { hashToken, verifyToken } from "@/lib/token";
import type { PublicSessionDTO } from "@/lib/dto";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function AttendPage({ params }: Props) {
  const { token } = await params;

  if (!verifyToken(token)) {
    notFound();
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      className: true,
      expiresAt: true,
      centerLat: true,
      centerLon: true,
      radiusM: true,
      closedAt: true,
    },
  });

  if (!session) {
    notFound();
  }

  const dto: PublicSessionDTO = {
    sessionId: session.id,
    className: session.className,
    expiresAt: session.expiresAt.toISOString(),
    centerLat: session.centerLat,
    centerLon: session.centerLon,
    radiusM: session.radiusM,
    closed:
      session.closedAt !== null ||
      // eslint-disable-next-line react-hooks/purity -- async RSC, runs once per request
      session.expiresAt.getTime() < Date.now(),
  };

  return (
    <main className="container mx-auto max-w-md flex-1 px-4 py-6 sm:py-10">
      <AttendFlow token={token} session={dto} />
    </main>
  );
}
