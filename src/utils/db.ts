import { createId } from "@paralleldrive/cuid2";

const dbPrefixes = {
  log: "log",
  service: "ser",
} as const;
export const createDbId = (key: keyof typeof dbPrefixes) => `${dbPrefixes[key]}_${createId()}`;
