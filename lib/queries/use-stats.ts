"use client";

import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/lib/api/stats";
import { queryKeys } from "./keys";

export function useStats() {
  return useQuery({ queryKey: queryKeys.stats, queryFn: getStats });
}
