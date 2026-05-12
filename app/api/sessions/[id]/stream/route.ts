import { subscribe } from "@/lib/sse-bus";
import type { AttendanceDTO, RejectedDTO } from "@/lib/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function sseFrame(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const safeEnqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };

      safeEnqueue(`: connected ${id}\n\n`);

      const heartbeat = setInterval(() => {
        safeEnqueue(`: ping\n\n`);
      }, 15_000);

      const unsubscribe = subscribe(id, {
        onAttendance: (p: AttendanceDTO) => safeEnqueue(sseFrame("attendance", p)),
        onRejection: (p: RejectedDTO) => safeEnqueue(sseFrame("rejection", p)),
        onClosed: () => safeEnqueue(sseFrame("closed", {})),
      });

      const onAbort = () => {
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
      request.signal.addEventListener("abort", onAbort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
