import { serve } from "bun";

import { createApp } from "./app";
import { ENV } from "./config/env";
import { logger } from "./lib/logger";

const app = createApp();

serve({
  port: ENV.PORT,
  fetch: app.fetch,
});

logger.info("server.started", {
  port: ENV.PORT,
  url: `http://localhost:${ENV.PORT}`,
});
