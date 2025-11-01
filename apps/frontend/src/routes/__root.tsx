import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import type { RouterContext } from "../router";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout
});

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
