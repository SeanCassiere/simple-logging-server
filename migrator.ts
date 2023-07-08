import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const main = async () => {
  const migrationClient = postgres(DB_URL, { max: 1 });
  const db = drizzle(migrationClient);
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete");
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
