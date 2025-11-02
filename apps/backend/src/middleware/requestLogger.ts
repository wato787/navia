import type { MiddlewareHandler } from "hono";

import { logger } from "../lib/logger";
import type { AppBindings } from "../types/app";

export const requestLogger = (): MiddlewareHandler<AppBindings> => {
  return async (c, next) => {
    const start = performance.now();

    try {
      await next();
    } finally {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      const status = c.res?.status ?? 500;
      const logLevel =
        status >= 500 ? "error" : status >= 400 ? "warn" : "info";

      logger[logLevel]("request.completed", {
        requestId: c.get("requestId"),
        method: c.req.method,
        path: c.req.path,
        status,
        durationMs,
      });
    }
  };
};
