import { Hono } from "hono";

import type { AppBindings } from "../types/app";

export const healthRouter = new Hono<AppBindings>();

healthRouter.get("/live", (c) =>
  c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }),
);

healthRouter.get("/ready", (c) =>
  c.json({
    status: "ready",
  }),
);
