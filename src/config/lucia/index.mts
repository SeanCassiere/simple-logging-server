import { GitHub } from "arctic";
import type { DatabaseUser } from "lucia";
import { Lucia } from "lucia";

import { db } from "@/config/db/index.mjs";
import { sessions, users } from "@/config/db/schema.mjs";
import { env } from "@/config/env.mjs";
import { DrizzleLuciaAdapter } from "./adapter.mjs";

export interface LuciaUser extends DatabaseUser {
  username: (typeof users.$inferSelect)["username"];
  githubId: (typeof users.$inferSelect)["githubId"];
}

const adapter = new DrizzleLuciaAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      githubId: attributes.githubId,
      username: attributes.username,
    };
  },
});

export const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<LuciaUser, "id">;
  }
}
