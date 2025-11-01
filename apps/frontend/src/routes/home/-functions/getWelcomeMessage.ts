import type { Audience, HomeHero } from "../-types";

const messages: Record<Audience, HomeHero> = {
  developer: {
    headline: "Build predictable SPA routing",
    description:
      "Combine TanStack Router with TanStack Query to keep routing and data loading type-safe.",
    highlights: [
      "File-based route structure",
      "Loaders and Suspense work together",
      "Search params stay strongly typed"
    ]
  },
  designer: {
    headline: "Focus on consistent layouts",
    description:
      "Layout routes let you reuse UI, while feature folders keep related concerns together.",
    highlights: [
      "Layouts and content clearly separated",
      "Route-level status boundaries",
      "Automatic navigation highlighting"
    ]
  },
  stakeholder: {
    headline: "Ship features without friction",
    description:
      "Preloading and caching keep the UI responsive and shorten feedback loops.",
    highlights: [
      "Instant responses with SWR cache",
      "Preload data on navigation intent",
      "Validated, shareable URL state"
    ]
  }
};

export async function getWelcomeMessage(audience: Audience): Promise<HomeHero> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return messages[audience];
}
