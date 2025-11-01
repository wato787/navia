import { Route as RootRoute } from "./routes/__root";
import { Route as HomeRoute } from "./routes/home/route";

export const routeTree = RootRoute.addChildren([HomeRoute]);
