import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

function makePrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  __db: ReturnType<typeof makePrisma> | undefined;
};

export const db = globalForPrisma.__db ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__db = db;
}
