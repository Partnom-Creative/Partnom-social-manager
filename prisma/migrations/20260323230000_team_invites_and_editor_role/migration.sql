-- AlterEnum: add EDITOR to UserRole (PostgreSQL)
ALTER TYPE "UserRole" ADD VALUE 'EDITOR';

-- CreateTable
CREATE TABLE "TeamInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "TeamInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamInvite_token_key" ON "TeamInvite"("token");

CREATE INDEX "TeamInvite_organizationId_idx" ON "TeamInvite"("organizationId");

ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
