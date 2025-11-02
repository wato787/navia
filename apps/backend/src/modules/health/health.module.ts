import { Hono } from "hono";

import type { AppBindings } from "../../types/app";
import type { RouteModule } from "../../types/router";
import { ok } from "../../utils/response";

const router = new Hono<AppBindings>();

router.get("/live", (c) =>
  ok(c, {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }),
);

router.get("/ready", (c) =>
  ok(c, {
    status: "ready",
  }),
);

export const healthModule: RouteModule = {
  basePath: "/health",
  router,
  description: "Health check endpoints for liveness and readiness",
};
