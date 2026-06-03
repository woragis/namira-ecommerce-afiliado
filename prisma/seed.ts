import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { runSeed } from "./seed/run";

config();

if (process.env.DIRECT_URL?.trim()) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const prisma = new PrismaClient();

async function main() {
  const result = await runSeed(prisma);
  console.log("Seed concluído:", result.stats.summary(result.mode, result.upgrade));
  if (result.mode === "ensure" && !result.includeDemo) {
    console.log(
      "Modo ensure: produtos demo, coleções e settings existentes não foram alterados.",
    );
    console.log("Use npm run db:seed:demo para dados de demonstração.");
    console.log("Use npm run db:seed:upgrade para aplicar defaults do repositório (--upgrade).");
  }
  if (result.destructive) {
    console.log("ALLOW_DESTRUCTIVE_SEED: coleção viral-agora e settings podem ter sido resetados.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
