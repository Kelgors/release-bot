-- CreateEnum
CREATE TYPE "RepositoryType" AS ENUM ('github');

-- CreateEnum
CREATE TYPE "ServerType" AS ENUM ('discord', 'telegram');

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "type" "ServerType" NOT NULL,
    "remoteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "type" "RepositoryType" NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "senderType" "ServerType" NOT NULL,
    "senderOptions" JSONB NOT NULL DEFAULT '"{}"',
    "lastVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "serverId" TEXT NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_type_remoteId_key" ON "Server"("type", "remoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_serverId_type_owner_name_key" ON "Repository"("serverId", "type", "owner", "name");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;
