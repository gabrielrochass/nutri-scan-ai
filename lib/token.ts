import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function getSecret(): string {
  const secret = process.env.ATTENDANCE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ATTENDANCE_SECRET env var missing or too short (need 32+ chars)",
    );
  }
  return secret;
}

function sign(nonce: string): string {
  return createHmac("sha256", getSecret())
    .update(nonce)
    .digest("base64url")
    .slice(0, 32);
}

export function signToken(): { token: string; hash: string } {
  const nonce = randomBytes(24).toString("base64url");
  const sig = sign(nonce);
  const token = `${nonce}.${sig}`;
  return { token, hash: hashToken(token) };
}

export function verifyToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [nonce, sig] = parts;
  if (!nonce || !sig) return false;
  const expected = sign(nonce);
  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + getSecret())
    .digest("hex")
    .slice(0, 32);
}
