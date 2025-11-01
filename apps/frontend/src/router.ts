import { QueryClient } from "@tanstack/react-query";
import { createRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export type RouterContext = {
  queryClient: QueryClient;
};

export const queryClient = new QueryClient();

const DefaultPending = () => (
  <div style={{ padding: "1.5rem", fontSize: "0.95rem" }}>Loading route...</div>
);

const DefaultRouterError = ({ error }: ErrorComponentProps) => (
  <div role="alert" style={{ padding: "1.5rem", color: "#b91c1c" }}>
    Routing error: {error.message ?? "Unknown error"}
  </div>
);

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPendingComponent: DefaultPending,
  defaultErrorComponent: DefaultRouterError,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
