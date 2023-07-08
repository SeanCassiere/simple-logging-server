import "dotenv/config";
import type { Config } from "drizzle-kit";

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default {
  schema: "./src/config/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: DB_URL,
  },
} satisfies Config;
