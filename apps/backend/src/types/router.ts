import type { Hono } from "hono";

import type { AppBindings } from "./app";

export type RouteModule = {
  basePath: `/${string}`;
  router: Hono<AppBindings>;
  description?: string;
};
