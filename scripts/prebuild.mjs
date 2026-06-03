import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env") });

if (!process.env.DATABASE_URL?.trim()) {
  console.log("[prebuild] DATABASE_URL ausente — pulando prisma db push");
  process.exit(0);
}

console.log("[prebuild] Aplicando schema Prisma no banco (db push)…");
try {
  execSync("npx prisma db push --skip-generate", {
    cwd: root,
    env: process.env,
    encoding: "utf8",
  });
  console.log("[prebuild] Schema aplicado com sucesso.");
} catch (error) {
  const out =
    (error && typeof error === "object" && "stdout" in error
      ? String(error.stdout)
      : "") +
    (error && typeof error === "object" && "stderr" in error
      ? String(error.stderr)
      : "") +
    (error instanceof Error ? error.message : String(error));

  if (out.includes("P1001") || out.includes("Can't reach database")) {
    console.warn(
      "[prebuild] Banco indisponível no build — continuando (páginas usam fallback).",
    );
    process.exit(0);
  }

  console.error(out);
  console.error(
    "[prebuild] Falha no db push. Confira DATABASE_URL, DIRECT_URL e permissões do Postgres.",
  );
  process.exit(1);
}
