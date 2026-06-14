import { apiClient } from "@/shared/api"
import { z } from "zod"

const healthSchema = z.object({
  status: z.string(),
  provider: z.string(),
})

export type HealthResponse = z.infer<typeof healthSchema>

export async function getHealth(): Promise<HealthResponse> {
  const data = await apiClient<unknown>("/health")
  return healthSchema.parse(data)
}
