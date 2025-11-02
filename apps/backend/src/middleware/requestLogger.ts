import type { MiddlewareHandler } from "hono";

import { logger } from "../lib/logger";
import type { AppBindings } from "../types/app";

export const requestLogger = (): MiddlewareHandler<AppBindings> => {
  return async (c, next) => {
    const start = performance.now();
    await next();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;

    logger.info("request.completed", {
      requestId: c.get("requestId"),
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs,
    });
  };
};
