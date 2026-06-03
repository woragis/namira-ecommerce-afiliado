import { afterEach, describe, expect, it } from "vitest";
import {
  parseDestructiveSeed,
  parseSeedMode,
  parseSeedUpgrade,
} from "../../../prisma/seed/mode";

describe("seed mode", () => {
  const env = { ...process.env };
  const argv = [...process.argv];

  afterEach(() => {
    process.env = { ...env };
    process.argv = [...argv];
  });

  it("parseSeedMode default ensure", () => {
    delete process.env.SEED_MODE;
    expect(parseSeedMode()).toBe("ensure");
    expect(parseSeedMode("demo")).toBe("demo");
    expect(parseSeedMode("invalid")).toBe("ensure");
  });

  it("parseSeedUpgrade via env e argv", () => {
    process.env.SEED_UPGRADE = "1";
    expect(parseSeedUpgrade()).toBe(true);
    delete process.env.SEED_UPGRADE;
    process.argv = ["node", "test", "--upgrade"];
    expect(parseSeedUpgrade()).toBe(true);
  });

  it("parseDestructiveSeed", () => {
    process.env.ALLOW_DESTRUCTIVE_SEED = "true";
    expect(parseDestructiveSeed()).toBe(true);
  });
});
