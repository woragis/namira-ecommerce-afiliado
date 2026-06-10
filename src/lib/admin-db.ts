import { prisma } from "@/lib/db";
import { isDatabaseConfigured, safeDbQuery } from "@/lib/safe-db";

const REQUIRED_TABLES = ["stores", "products", "product_media"] as const;

/** Verifica se as tabelas essenciais da NaMira existem no banco conectado. */
export async function isNamiraSchemaReady(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  return safeDbQuery(async () => {
    for (const table of REQUIRED_TABLES) {
      await prisma.$queryRawUnsafe(`SELECT 1 FROM "${table}" LIMIT 1`);
    }
    return true;
  }, false);
}

export { safeDbQuery };
