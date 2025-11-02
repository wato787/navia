import { Hono } from "hono";

export const healthRouter = new Hono();

healthRouter.get("/", (c) =>
  c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }),
);

healthRouter.get("/readiness", (c) => c.text("ready"));
