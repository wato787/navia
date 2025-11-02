import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";

import { ENV, isProduction } from "../config/env";
import { logger } from "../lib/logger";
import { requestLogger } from "../middleware/requestLogger";
import { registerRoutes } from "../routes";
import type { AppBindings } from "../types/app";

export const createApp = () => {
  const app = new Hono<AppBindings>();

  app.use("*", trimTrailingSlash());
  app.use("*", requestId());
  app.use(
    "*",
    cors({
      origin: ENV.BASE_URL ?? "*",
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400,
    }),
  );

  if (!isProduction) {
    app.use("*", prettyJSON());
  }

  app.use("*", requestLogger());

  registerRoutes(app);

  app.notFound((c) =>
    c.json(
      {
        error: {
          message: "Resource not found",
        },
      },
      404,
    ),
  );

  app.onError((err, c) => {
    logger.error("error", {
      error: err,
      requestId: c.get("requestId"),
    });
    return c.json(
      {
        error: {
          message: "Internal server error",
        },
      },
      500,
    );
  });

  return app;
};
