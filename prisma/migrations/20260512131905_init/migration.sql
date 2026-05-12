-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLon" DOUBLE PRECISION NOT NULL,
    "radiusM" INTEGER NOT NULL DEFAULT 50,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "createdByLabel" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "accuracyM" DOUBLE PRECISION,
    "distanceM" DOUBLE PRECISION NOT NULL,
    "fingerprintHash" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "ip" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RejectedAttempt" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "name" TEXT,
    "matricula" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "distanceM" DOUBLE PRECISION,
    "fingerprintHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RejectedAttempt_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RejectedAttempt" ADD CONSTRAINT "RejectedAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
