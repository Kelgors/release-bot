-- CreateEnum
CREATE TYPE "RepositoryType" AS ENUM ('github');

-- CreateEnum
CREATE TYPE "ServerType" AS ENUM ('discord', 'telegram');

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "type" "ServerType" NOT NULL,
    "name" TEXT NOT NULL,
    "remoteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "type" "RepositoryType" NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_type_remoteId_key" ON "Server"("type", "remoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_type_owner_name_key" ON "Repository"("type", "owner", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_serverId_channelId_repositoryId_key" ON "Channel"("serverId", "channelId", "repositoryId");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
