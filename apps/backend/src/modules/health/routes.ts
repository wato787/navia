import { Hono } from "hono";

import type { AppBindings } from "../../types/app";
import { ok } from "../../utils/response";

const health = new Hono<AppBindings>();

health.get("/live", (c) =>
  ok(c, {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }),
);

health.get("/ready", (c) =>
  ok(c, {
    status: "ready",
  }),
);

export default health;
