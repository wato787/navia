import { Route as RootRoute } from "./routes/__root";
import { Route as TopRoute } from "./routes/top/route";

export const routeTree = RootRoute.addChildren([TopRoute as any]);
