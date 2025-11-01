import { createRoute } from "@tanstack/react-router";

import { Route as RootRoute } from "./__root";
import TopPage from "./lazy";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: TopPage,
});
