import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "@/config/env.mjs";
import * as schema from "./schema.mjs";

export const db = drizzle({
  connection: env.DATABASE_URL,
  schema,
  logger: !(env.NODE_ENV === "production"),
  casing: "snake_case",
});
