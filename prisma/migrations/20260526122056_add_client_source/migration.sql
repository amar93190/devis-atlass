-- CreateEnum
CREATE TYPE "ClientSource" AS ENUM ('MANUAL', 'IMPORTED');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "source" "ClientSource" NOT NULL DEFAULT 'MANUAL';
