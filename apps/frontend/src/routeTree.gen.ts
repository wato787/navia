import { Route as RootRoute } from "./routes/__root";
import { Route as TopRoute } from "./routes/top/route";

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "./routes/top/route": {
      id: "./routes/top/route";
      path: "/";
      fullPath: "/";
      parentRoute: typeof RootRoute;
      preLoaderRoute: typeof TopRoute;
    };
  }
}

export const routeTree = RootRoute.addChildren([TopRoute]);
