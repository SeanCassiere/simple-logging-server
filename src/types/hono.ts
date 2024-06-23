import type { services as servicesTable } from "@/config/db/schema";

type Service = typeof servicesTable.$inferSelect;

type Variables = {
  service: Service | null;
};

export type ServerContext = {
  Bindings: {};
  Variables: Variables;
};
