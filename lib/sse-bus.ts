import { EventEmitter } from "node:events";
import type { AttendanceDTO, RejectedDTO } from "./dto";

const globalForBus = globalThis as unknown as { __sseBus?: EventEmitter };

const bus =
  globalForBus.__sseBus ??
  (() => {
    const e = new EventEmitter();
    e.setMaxListeners(0);
    return e;
  })();

if (process.env.NODE_ENV !== "production") {
  globalForBus.__sseBus = bus;
}

type Channel = "attendance" | "rejection" | "closed";

function channelKey(sessionId: string, channel: Channel): string {
  return `${sessionId}:${channel}`;
}

export function emitAttendance(sessionId: string, payload: AttendanceDTO): void {
  bus.emit(channelKey(sessionId, "attendance"), payload);
}

export function emitRejection(sessionId: string, payload: RejectedDTO): void {
  bus.emit(channelKey(sessionId, "rejection"), payload);
}

export function emitClosed(sessionId: string): void {
  bus.emit(channelKey(sessionId, "closed"), {});
}

export function subscribe(
  sessionId: string,
  handlers: {
    onAttendance: (p: AttendanceDTO) => void;
    onRejection: (p: RejectedDTO) => void;
    onClosed: () => void;
  },
): () => void {
  const att = channelKey(sessionId, "attendance");
  const rej = channelKey(sessionId, "rejection");
  const clo = channelKey(sessionId, "closed");

  bus.on(att, handlers.onAttendance);
  bus.on(rej, handlers.onRejection);
  bus.on(clo, handlers.onClosed);

  return () => {
    bus.off(att, handlers.onAttendance);
    bus.off(rej, handlers.onRejection);
    bus.off(clo, handlers.onClosed);
  };
}
