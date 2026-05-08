import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@release-bot/db";
import { env } from "./env.js";

const uri = new URL(`${env.DATABASE_URL}`);

const adapter = new PrismaPg({
  host: uri.hostname,
  port: parseInt(uri.port, 10) || 5432,
  user: uri.username,
  password: uri.password,
  database: uri.pathname.slice(1),
});
const prisma = new PrismaClient({ adapter });

export { prisma };
