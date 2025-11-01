import { Route as RootRoute } from "./routes/__root";
import { Route as TopRoute } from "./routes/index";

export const routeTree = RootRoute.addChildren([TopRoute]);
