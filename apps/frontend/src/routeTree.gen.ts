import { Route as RootRoute } from "./routes/__root";
import { Route as HomeRoute } from "./routes/home/route";
import { Route as AboutRoute } from "./routes/about/route";

export const routeTree = RootRoute.addChildren([HomeRoute, AboutRoute]);
