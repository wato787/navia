import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";

import { ENV, isProduction } from "../config/env";
import { requestLogger } from "../middleware/requestLogger";
import { registerRoutes } from "../routes";
import type { AppBindings } from "../types/app";
import { handleError } from "../errors/handleError";

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

  app.onError(handleError);

  return app;
};
