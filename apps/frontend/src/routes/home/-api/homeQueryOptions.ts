import { queryOptions } from "@tanstack/react-query";
import type { Audience } from "../-types";
import { getWelcomeMessage } from "../-functions/getWelcomeMessage";

export const homeQueryOptions = (audience: Audience) =>
  queryOptions({
    queryKey: ["home", "welcome", audience],
    queryFn: () => getWelcomeMessage(audience),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10
  });
