import {
  Link,
  Outlet,
  RootRoute,
  Route,
  createRouter
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import AboutPage from "./pages/AboutPage";
import HomePage from "./pages/HomePage";

const rootRoute = new RootRoute({
  component: RootLayout
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage
});

const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "about",
  component: AboutPage
});

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);

export const router = createRouter({
  routeTree
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function RootLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#f8fafc"
      }}
    >
      <header
        style={{
          padding: "1.5rem 0",
          backgroundColor: "#0f172a",
          color: "#f8fafc"
        }}
      >
        <nav
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1rem"
          }}
        >
          <span style={{ fontWeight: 600 }}>TanStack Router Demo</span>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{ style: { textDecoration: "underline" } }}
              style={{ color: "inherit" }}
            >
              Home
            </Link>
            <Link
              to="/about"
              activeProps={{ style: { textDecoration: "underline" } }}
              style={{ color: "inherit" }}
            >
              About
            </Link>
          </div>
        </nav>
      </header>
      <section
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "2rem 1rem"
        }}
      >
        <Outlet />
      </section>
      {!import.meta.env.PROD ? (
        <TanStackRouterDevtools position="bottom-right" />
      ) : null}
    </div>
  );
}

export type AppRouter = typeof router;
