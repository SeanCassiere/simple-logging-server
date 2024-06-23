import { Hono } from "hono";

import servicesRouter from "./services";
import logsRouter from "./logging";

import type { ServerContext } from "@/types/hono";

const app = new Hono<ServerContext>();

app.route("/service", servicesRouter);
app.route("/log", logsRouter);

export default app;
