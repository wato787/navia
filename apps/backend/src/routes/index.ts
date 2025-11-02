import { Hono } from "hono";

import { healthRouter } from "./health";

export const routes = new Hono();

routes.route("/healthz", healthRouter);
