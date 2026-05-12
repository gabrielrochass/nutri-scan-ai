import { z } from "zod";

export const createSessionSchema = z.object({
  className: z.string().trim().min(1, "Nome da turma é obrigatório").max(120),
  centerLat: z.number().min(-90).max(90),
  centerLon: z.number().min(-180).max(180),
  radiusM: z.number().int().min(5).max(2000).default(50),
  expiresInMinutes: z.number().int().min(1).max(180).default(5),
  createdByLabel: z.string().trim().max(120).optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const attendSubmitSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(120),
  matricula: z
    .string()
    .trim()
    .min(3, "Matrícula muito curta")
    .max(40)
    .regex(/^[A-Za-z0-9._-]+$/, "Matrícula inválida"),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  accuracyM: z.number().nonnegative().max(100_000).optional(),
  fingerprintHash: z.string().regex(/^[a-f0-9]{64}$/, "Fingerprint inválido"),
  consent: z.literal(true),
});

export type AttendSubmitInput = z.infer<typeof attendSubmitSchema>;

export const patchSessionSchema = z.object({
  close: z.literal(true),
});
