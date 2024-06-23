import type { HttpBindings } from "@hono/node-server";
import type { services as servicesTable } from "@/config/db/schema";

type Service = typeof servicesTable.$inferSelect;

type Bindings = HttpBindings & {};

type Variables = {
  service: Service | null;
};

export type ServerContext = {
  Bindings: Bindings;
  Variables: Variables;
};
