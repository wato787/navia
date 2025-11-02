import type { Hono } from "hono";
import { healthModule } from "../modules";
import type { AppBindings } from "../types/app";
import type { RouteModule } from "../types/router";

export const apiModules: RouteModule[] = [healthModule];

export const registerApiModules = (api: Hono<AppBindings>) => {
  apiModules.forEach(({ basePath, router }) => {
    api.route(basePath, router);
  });
};
