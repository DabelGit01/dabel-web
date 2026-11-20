-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sensors" JSONB NOT NULL DEFAULT '[]',
    "actuators" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceId_key" ON "Device"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_serialNumber_key" ON "Device"("serialNumber");

-- CreateIndex
CREATE INDEX "Device_deviceType_deviceId_idx" ON "Device"("deviceType", "deviceId");
