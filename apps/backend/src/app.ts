import { Hono } from "hono";

import { requestLogger } from "./middleware/requestLogger";
import { logger } from "./lib/logger";
import { routes } from "./routes";

export const createApp = () => {
  const app = new Hono();

  app.use("*", requestLogger());

  app.route("/api", routes);

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
    logger.error("app.error", {
      message: err.message,
      stack: err.stack,
    });
    return c.json(
      {
        error: {
          message: "Internal Server Error",
        },
      },
      500,
    );
  });

  return app;
};
