import { PrismaClient } from "@prisma/client";

export async function assertDatabaseAvailable(): Promise<boolean> {
  if (!process.env.DATABASE_URL?.trim()) return false;
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function globalSetup() {
  const ok = await assertDatabaseAvailable();
  if (!ok) {
    console.warn(
      "\n⚠️  Postgres indisponível — testes de integração serão ignorados.\n" +
        "   Rode: npm run docker:up && npm run db:push && npm run db:seed\n",
    );
  }
}
