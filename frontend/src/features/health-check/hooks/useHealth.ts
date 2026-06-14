import { useQuery } from "@tanstack/react-query";
import { getHealth, type HealthResponse } from "../api";

export function useHealth() {
  return useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: getHealth,
    enabled: false,
  });
}
