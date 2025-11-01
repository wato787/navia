import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { homeQueryOptions } from "./-api/homeQueryOptions";
import type { Audience } from "./-types";
import { HomeHeroSection } from "./-components/HomeHeroSection";
import { Route } from "./route";

const audiences: Audience[] = ["developer", "designer", "stakeholder"];

export function HomeRoute() {
  const navigate = useNavigate({ from: "/" });
  const search = Route.useSearch();
  const loaderData = Route.useLoaderData();

  const activeAudience = loaderData.audience;
  const { data } = useSuspenseQuery(homeQueryOptions(activeAudience));

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <p style={{ margin: 0, color: "#475569" }}>
        Search params are treated as global state. Choose an audience to see how the loader and
        React Query work together.
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {audiences.map((audience) => {
          const isActive = audience === search.audience;
          return (
            <button
              key={audience}
              type="button"
              onClick={() =>
                navigate({
                  search: () => ({ audience })
                })
              }
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "9999px",
                border: "1px solid",
                borderColor: isActive ? "#0f172a" : "#cbd5f5",
                backgroundColor: isActive ? "#0f172a" : "white",
                color: isActive ? "white" : "#0f172a",
                cursor: "pointer"
              }}
            >
              {audience}
            </button>
          );
        })}
      </div>
      <HomeHeroSection hero={data} />
    </div>
  );
}
