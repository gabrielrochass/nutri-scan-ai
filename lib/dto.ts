export type AttendanceDTO = {
  id: string;
  name: string;
  matricula: string;
  distanceM: number;
  lat: number;
  lon: number;
  createdAt: string;
};

export type RejectedDTO = {
  id: string;
  reason: string;
  name: string | null;
  matricula: string | null;
  distanceM: number | null;
  createdAt: string;
};

export type SessionDTO = {
  id: string;
  className: string;
  centerLat: number;
  centerLon: number;
  radiusM: number;
  expiresAt: string;
  closedAt: string | null;
  createdByLabel: string | null;
  attendances: AttendanceDTO[];
};

export type PublicSessionDTO = {
  sessionId: string;
  className: string;
  expiresAt: string;
  centerLat: number;
  centerLon: number;
  radiusM: number;
  closed: boolean;
};
