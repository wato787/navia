import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({}).lazy(async () => {
  const module = await import("./index.lazy");
  return {
    component: module.RouteComponent,
  };
});
