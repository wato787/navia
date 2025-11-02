import { Hono } from "hono";

import { ENV } from "../config/env";
import health from "../modules/health";
import places from "../modules/places";
import type { AppBindings } from "../types/app";
import { ok } from "../utils/response";

export const registerRoutes = (app: Hono<AppBindings>) => {
  // Root endpoint
  app.get("/", (c) =>
    ok(c, {
      name: "@bun-mise/backend",
      status: "ok",
      environment: ENV.NODE_ENV,
      timestamp: new Date().toISOString(),
    }),
  );

  // Legacy healthz redirect
  app.get("/healthz", (c) => c.redirect("/api/health/live"));

  // API routes
  const api = new Hono<AppBindings>();
  api.route("/health", health);
  api.route("/places", places);

  app.route("/api", api);
};
