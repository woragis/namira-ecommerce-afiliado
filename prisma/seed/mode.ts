export type SeedMode = "ensure" | "demo";

export function parseSeedMode(raw?: string): SeedMode {
  const v = (raw ?? process.env.SEED_MODE ?? "ensure").toLowerCase();
  return v === "demo" ? "demo" : "ensure";
}

export function parseSeedUpgrade(): boolean {
  if (process.env.SEED_UPGRADE === "1" || process.env.SEED_UPGRADE === "true") {
    return true;
  }
  return process.argv.includes("--upgrade");
}

export function parseDestructiveSeed(): boolean {
  return (
    process.env.ALLOW_DESTRUCTIVE_SEED === "1" ||
    process.env.ALLOW_DESTRUCTIVE_SEED === "true"
  );
}
