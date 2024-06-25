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
  dev: "dev_",
};
/**
 * Returns a unique database ID
 * @param key
 * @param env
 * @returns
 * @example
 * ```ts
 * createDbId("user", "live");
 * //=> "user_live_01B1E5Z5KQZ
 * ```
 */
export const createDbId = (key: keyof typeof dbPrefixes, env: keyof typeof dbEnv = "live") => {
  return [dbPrefixes[key], dbEnv[env], createId()].filter(Boolean).join("");
};
