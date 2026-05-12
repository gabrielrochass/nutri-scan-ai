const UTF8_BOM = "﻿";
const DELIMITER = ";";
const NEWLINE = "\r\n";

const SIGAA_HEADERS = [
  "Matricula",
  "Nome_Discente",
  "Faltas",
  "Assinatura",
] as const;

const AUDIT_HEADERS = [
  "Matricula",
  "Nome_Discente",
  "Data_Assinatura",
  "Hora_Assinatura",
  "Registrado_Em_ISO",
  "Distancia_Metros",
  "Precisao_GPS_Metros",
  "Latitude",
  "Longitude",
  "IP_Dispositivo",
  "User_Agent",
  "Fingerprint_SHA256",
  "ID_Registro",
] as const;

export type SigaaRow = {
  matricula: string;
  name: string;
  faltas: number;
};

export type AuditRow = {
  id: string;
  matricula: string;
  name: string;
  createdAt: Date;
  distanceM: number;
  accuracyM: number | null;
  lat: number;
  lon: number;
  ip: string | null;
  userAgent: string;
  fingerprintHash: string;
};

function escapeCell(value: string): string {
  const needsQuote =
    value.includes(DELIMITER) || value.includes('"') || /[\r\n]/.test(value);
  if (!needsQuote) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function formatNumber(n: number, fractionDigits = 2): string {
  return n.toFixed(fractionDigits).replace(".", ",");
}

function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function buildCsv(headers: readonly string[], lines: string[][]): string {
  const headerLine = headers.join(DELIMITER);
  const bodyLines = lines.map((cells) =>
    cells.map((c) => escapeCell(c)).join(DELIMITER),
  );
  return UTF8_BOM + [headerLine, ...bodyLines].join(NEWLINE) + NEWLINE;
}

export function toSigaaCsv(rows: SigaaRow[]): string {
  return buildCsv(
    SIGAA_HEADERS,
    rows.map((r) => [r.matricula, r.name, String(r.faltas), ""]),
  );
}

export function toAuditCsv(rows: AuditRow[]): string {
  return buildCsv(
    AUDIT_HEADERS,
    rows.map((r) => [
      r.matricula,
      r.name,
      formatDate(r.createdAt),
      formatTime(r.createdAt),
      r.createdAt.toISOString(),
      formatNumber(r.distanceM, 2),
      r.accuracyM !== null ? formatNumber(r.accuracyM, 2) : "",
      formatNumber(r.lat, 6),
      formatNumber(r.lon, 6),
      r.ip ?? "",
      r.userAgent,
      r.fingerprintHash,
      r.id,
    ]),
  );
}

export function slugifyForFilename(input: string): string {
  return (
    input
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "sessao"
  );
}
