import type { KnowledgeBase } from "../-types";

const knowledge: KnowledgeBase[] = [
  {
    title: "Routing philosophy",
    bullets: [
      "Typed navigation for every route",
      "Loader-based preloading policies",
      "Consistent layout composition"
    ]
  },
  {
    title: "Data layer",
    bullets: [
      "React Query suspense-first API",
      "Loader dependencies define cache keys",
      "Search params double as global state"
    ]
  },
  {
    title: "Developer experience",
    bullets: [
      "Feature-first directory structure",
      "Automatic code splitting support",
      "Devtools wired per environment"
    ]
  }
];

export function getTeamFocus(): KnowledgeBase[] {
  return knowledge;
}
