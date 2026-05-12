function canvasHash(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 220;
    canvas.height = 30;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";

    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 220, 30);
    ctx.fillStyle = "#069";
    ctx.fillText("attendance-fp-v1", 2, 2);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("attendance-fp-v1", 4, 5);

    const dataUrl = canvas.toDataURL();
    return dataUrl.slice(-64);
  } catch {
    return "canvas-blocked";
  }
}

export async function computeFingerprint(): Promise<string> {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const parts = [
    navigator.userAgent,
    String(navigator.hardwareConcurrency ?? 0),
    String(nav.deviceMemory ?? 0),
    `${screen.width}x${screen.height}`,
    String(screen.colorDepth ?? 0),
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "no-tz",
    navigator.language ?? "no-lang",
    canvasHash(),
  ];
  const raw = parts.join("|");

  const buf = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
