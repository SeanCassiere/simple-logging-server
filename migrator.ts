import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const main = async () => {
  const start = new Date();

  const client = postgres(DB_URL, { max: 1 });
  const db = drizzle(client);

  await migrate(db, { migrationsFolder: "./drizzle" });
  await client.end();

  const end = new Date();
  console.log(`Migrations complete in ${end.getTime() - start.getTime()}ms`);
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
