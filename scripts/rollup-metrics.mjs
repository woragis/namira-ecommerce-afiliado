/**
 * Rollup manual: agrega eventos em product_metrics_daily.
 * Uso: node scripts/rollup-metrics.mjs [dias]
 */
import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const days = Number(process.argv[2] ?? "90");

config({ path: join(root, ".env") });
if (process.env.DIRECT_URL?.trim()) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const r = spawnSync(
  "npx",
  [
    "tsx",
    "-e",
    `import { rollupMetricsRecentDays } from "./src/lib/analytics-rollup.ts"; const n = await rollupMetricsRecentDays(${days}); console.log("Rollup:", n, "dias");`,
  ],
  { cwd: root, stdio: "inherit", shell: true, env: process.env },
);

process.exit(r.status ?? 1);
