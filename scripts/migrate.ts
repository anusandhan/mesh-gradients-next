// Applies db/schema.sql to DATABASE_URL. Idempotent.
// Run with: npm run db:migrate

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (add it to .env.local and run with dotenv, or export it)");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(join(__dirname, "..", "db", "schema.sql"), "utf8");

const statements = schema
  .split(/;\s*(?:\r?\n|$)/)
  .map((s) => s.trim())
  .filter(Boolean);

(async () => {
  for (const statement of statements) {
    await sql.query(statement);
  }
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  console.log(
    "migrated. tables:",
    tables.map((t) => (t as { table_name: string }).table_name).join(", ")
  );
})();
