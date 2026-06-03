/**
 * Executa o seed com DIRECT_URL (evita falha no pooler :6543).
 * Uso: node scripts/run-seed.mjs [ensure|demo] [--upgrade]
 */
import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

config({ path: join(root, ".env") });

const mode = process.argv[2] === "demo" ? "demo" : "ensure";
const upgrade = process.argv.includes("--upgrade");

if (process.env.DIRECT_URL?.trim()) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

process.env.SEED_MODE = mode;
if (upgrade) process.env.SEED_UPGRADE = "1";

const r = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(r.status ?? 1);
