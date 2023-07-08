import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { env } from "../env";

const queryClient = postgres(env.DATABASE_URL);
export const db: PostgresJsDatabase<typeof schema> = drizzle(queryClient, { schema });
