import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "@/lib/env";
import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

/** Dev singleton survives HMR — after schema changes restart dev (see `predev` in package.json). */
export const prisma =
  global.__prisma ??
  new PrismaClient({
    adapter: new PrismaPg(new Pool({ connectionString: env.DATABASE_URL })),
  });

if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

