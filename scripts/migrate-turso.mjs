import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env");
  process.exit(1);
}

const client = createClient({ url, authToken });

const sql = readFileSync(
  resolve(__dirname, "../prisma/migrations/20260831194504_init/migration.sql"),
  "utf8"
);

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

console.log(`Running ${statements.length} statements against ${url}...`);

for (const statement of statements) {
  await client.execute(statement);
  console.log("✓", statement.slice(0, 60).replace(/\n/g, " "));
}

console.log("\nDone — tables created in Turso.");
