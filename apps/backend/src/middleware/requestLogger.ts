import type { MiddlewareHandler } from "hono";

import { logger } from "../lib/logger";

export const requestLogger = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = performance.now();
    await next();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;

    logger.info("request.completed", {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs,
    });
  };
};
