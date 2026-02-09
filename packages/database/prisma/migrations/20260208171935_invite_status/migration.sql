-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'PENDING';
