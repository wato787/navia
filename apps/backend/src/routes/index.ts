import { Hono } from "hono";

import { ENV } from "../config/env";
import type { AppBindings } from "../types/app";
import { healthRouter } from "./health";

const createApiRouter = () => {
  const api = new Hono<AppBindings>();
  api.route("/health", healthRouter);
  return api;
};

export const registerRoutes = (app: Hono<AppBindings>) => {
  app.get("/", (c) =>
    c.json({
      name: "@bun-mise/backend",
      status: "ok",
      environment: ENV.NODE_ENV,
      timestamp: new Date().toISOString(),
    }),
  );

  app.get("/healthz", (c) => c.redirect("/api/health/live"));

  app.route("/api", createApiRouter());
};
