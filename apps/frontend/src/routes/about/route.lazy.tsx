import { useNavigate } from "@tanstack/react-router";
import { AboutKnowledgeSection } from "./-components/AboutKnowledgeSection";
import { Route } from "./route";

type Focus = "routing" | "data" | "dx";

const focusLabels: Record<Focus, string> = {
  routing: "Routing",
  data: "Data",
  dx: "DX"
};

export function AboutRoute() {
  const navigate = useNavigate({ from: "/about" });
  const { knowledge } = Route.useLoaderData();
  const { focus } = Route.useSearch();

  const activeIndex = focus === "data" ? 1 : focus === "dx" ? 2 : 0;

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {(Object.keys(focusLabels) as Focus[]).map((nextFocus) => {
          const isActive = nextFocus === focus;
          return (
            <button
              key={nextFocus}
              type="button"
              onClick={() =>
                navigate({
                  search: () => ({ focus: nextFocus })
                })
              }
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid",
                borderColor: isActive ? "#0f172a" : "#cbd5f5",
                backgroundColor: isActive ? "#0f172a" : "white",
                color: isActive ? "white" : "#0f172a",
                cursor: "pointer"
              }}
            >
              {focusLabels[nextFocus]}
            </button>
          );
        })}
      </div>
      <AboutKnowledgeSection items={[knowledge[activeIndex]]} />
      <p style={{ margin: 0, color: "#475569" }}>
        All notes stay cached, but the active focus is driven by search params. Share the URL to
        communicate the exact perspective you are reviewing.
      </p>
    </div>
  );
}
