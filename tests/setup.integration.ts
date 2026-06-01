import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });

// Garante ADMIN_SECRET para testes de auth admin
if (!process.env.ADMIN_SECRET?.trim()) {
  process.env.ADMIN_SECRET = "dev-admin-secret";
}
