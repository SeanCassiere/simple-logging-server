import type { HttpBindings } from "@hono/node-server";
import type { Session, User } from "lucia";

import type { ServiceRecord, TenantRecord } from "./db.mjs";

type Bindings = HttpBindings & {};

type Variables = {
  service: ServiceRecord | null;
  tenant: TenantRecord | null;
  user: User | null;
  session: Session | null;
};

export type ServerContext = {
  Bindings: Bindings;
  Variables: Variables;
};
