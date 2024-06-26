import { env } from "@/config/env.mjs";
import { createId } from "@paralleldrive/cuid2";

const dbPrefixes = {
  log: "log_",
  service: "ser_",
  user: "user_",
  session: "sess_",
  tenant: "ten_",
} as const;
const dbEnv = {
  live: "live_",
  test: "test_",
  dev: "dev_",
};
/**
 * Returns a unique database ID
 * @param key_prefix
 * @param key_env
 * @returns
 * @example
 * ```ts
 * createDbId("user", "live");
 * //=> "user_live_01B1E5Z5KQZ
 * ```
 */
export const createDbId = (
  key_prefix: keyof typeof dbPrefixes,
  key_env: keyof typeof dbEnv = env.NODE_ENV === "production" ? "live" : "dev",
) => {
  return [dbPrefixes[key_prefix], dbEnv[key_env], createId()].filter(Boolean).join("");
};
