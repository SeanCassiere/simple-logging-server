import { createId } from "@paralleldrive/cuid2";

export const createDbId = (prefix: string) => `${prefix}_${createId()}`;
export const dbPrefixes = {
  log: "log",
} as const;
