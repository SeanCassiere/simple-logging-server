import type { db } from "@/config/db/index.mjs";
import type { sessions, users } from "@/config/db/schema.mjs";
import { eq, lte } from "drizzle-orm";
import type { Adapter, DatabaseSession, DatabaseUser, UserId } from "lucia";

type Database = typeof db;
type DatabaseSessionTable = typeof sessions;
type DatabaseUserTable = typeof users;

export class DrizzleLuciaAdapter implements Adapter {
  db: Database;
  sessionTable: DatabaseSessionTable;
  userTable: DatabaseUserTable;

  constructor(dbInstance: Database, sessionTable: DatabaseSessionTable, usersTable: DatabaseUserTable) {
    this.db = dbInstance;
    this.sessionTable = sessionTable;
    this.userTable = usersTable;
  }

  public async getSessionAndUser(
    sessionId: string,
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const result = await this.db
      .select({ user: this.userTable, session: this.sessionTable })
      .from(this.sessionTable)
      .innerJoin(this.userTable, eq(this.sessionTable.userId, this.userTable.id))
      .where(eq(this.sessionTable.id, sessionId))
      .execute();

    if (result.length !== 1) return [null, null];

    const { session, user } = result[0]!;

    return [transformIntoDatabaseSession(session), transformIntoDatabaseUser(user)];
  }
  public async getUserSessions(userId: UserId): Promise<DatabaseSession[]> {
    const result = await this.db.select().from(this.sessionTable).where(eq(this.sessionTable.userId, userId));
    return result.map((val) => {
      return transformIntoDatabaseSession(val);
    });
  }
  public async setSession(session: DatabaseSession): Promise<void> {
    await this.db.insert(this.sessionTable).values({
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      ...session.attributes,
    });
  }
  public async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    await this.db
      .update(this.sessionTable)
      .set({
        expiresAt: expiresAt,
      })
      .where(eq(this.sessionTable.id, sessionId));
  }
  public async deleteSession(sessionId: string): Promise<void> {
    await this.db.delete(this.sessionTable).where(eq(this.sessionTable.id, sessionId));
  }
  public async deleteUserSessions(userId: UserId): Promise<void> {
    await this.db.delete(this.sessionTable).where(eq(this.sessionTable.userId, userId));
  }
  public async deleteExpiredSessions(): Promise<void> {
    await this.db.delete(this.sessionTable).where(lte(this.sessionTable.expiresAt, new Date()));
  }
}

function transformIntoDatabaseSession(raw: typeof sessions.$inferSelect): DatabaseSession {
  const { id, userId, expiresAt, ...attributes } = raw;
  return {
    userId,
    id,
    expiresAt,
    attributes,
  };
}

function transformIntoDatabaseUser(raw: typeof users.$inferSelect): DatabaseUser {
  const { id, ...attributes } = raw;
  return { id, attributes: attributes } as unknown as DatabaseUser;
}
