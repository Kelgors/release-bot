import { createPrismaClient } from "@release-bot/db";
import { env } from "./env.js";

export const prisma = createPrismaClient(env.DATABASE_URL);
