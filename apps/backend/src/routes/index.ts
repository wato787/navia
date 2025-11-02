import { Hono } from "hono";

import { ENV } from "../config/env";
import { ok } from "../utils/response";
import type { AppBindings } from "../types/app";
import { registerApiModules } from "./modules";

export const registerRoutes = (app: Hono<AppBindings>) => {
  app.get("/", (c) =>
    ok(c, {
      name: "@bun-mise/backend",
      status: "ok",
      environment: ENV.NODE_ENV,
      timestamp: new Date().toISOString(),
    }),
  );

  app.get("/healthz", (c) => c.redirect("/api/health/live"));

  const api = new Hono<AppBindings>();
  registerApiModules(api);
  app.route("/api", api);
};
