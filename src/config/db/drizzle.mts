import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/config/env.mjs";
import * as schema from "./schema.mjs";

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema, logger: true });
