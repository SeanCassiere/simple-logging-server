import type { HttpBindings } from "@hono/node-server";
import type { Session, User } from "lucia";

import type { services as servicesTable } from "@/config/db/schema";
type Service = typeof servicesTable.$inferSelect;

type Bindings = HttpBindings & {};

type Variables = {
  service: Service | null;
  user: User | null;
  session: Session | null;
};

export type ServerContext = {
  Bindings: Bindings;
  Variables: Variables;
};
