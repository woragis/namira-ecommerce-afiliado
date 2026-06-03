import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isDatabaseConfigured, safeDbQuery } from "@/lib/safe-db";

/** Verifica se as tabelas da NaMira existem no banco conectado. */
export async function isNamiraSchemaReady(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  return safeDbQuery(async () => {
    await prisma.$queryRaw`SELECT 1 FROM "stores" LIMIT 1`;
    return true;
  }, false);
}

export { safeDbQuery };
