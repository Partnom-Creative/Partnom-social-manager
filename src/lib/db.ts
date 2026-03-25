import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizePgConnectionString } from "@/lib/normalize-pg-connection-string";

function makePrisma() {
  const raw = process.env.DATABASE_URL;
  if (!raw?.trim()) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and set your Postgres URL."
    );
  }
  const adapter = new PrismaPg({
    connectionString: normalizePgConnectionString(raw),
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  __db: ReturnType<typeof makePrisma> | undefined;
};

export const db = globalForPrisma.__db ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__db = db;
}
