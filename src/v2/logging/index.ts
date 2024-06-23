import { Hono } from "hono";

import type { ServerContext } from "@/types/hono";

const app = new Hono<ServerContext>();

export default app;
