-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "className" TEXT NOT NULL,
    "centerLat" REAL NOT NULL,
    "centerLon" REAL NOT NULL,
    "radiusM" INTEGER NOT NULL DEFAULT 50,
    "tokenHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "closedAt" DATETIME,
    "createdByLabel" TEXT
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lon" REAL NOT NULL,
    "accuracyM" REAL,
    "distanceM" REAL NOT NULL,
    "fingerprintHash" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "ipHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RejectedAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "name" TEXT,
    "matricula" TEXT,
    "lat" REAL,
    "lon" REAL,
    "distanceM" REAL,
    "fingerprintHash" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RejectedAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "AttendanceRecord_sessionId_createdAt_idx" ON "AttendanceRecord"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_sessionId_fingerprintHash_key" ON "AttendanceRecord"("sessionId", "fingerprintHash");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_sessionId_matricula_key" ON "AttendanceRecord"("sessionId", "matricula");

-- CreateIndex
CREATE INDEX "RejectedAttempt_sessionId_createdAt_idx" ON "RejectedAttempt"("sessionId", "createdAt");
