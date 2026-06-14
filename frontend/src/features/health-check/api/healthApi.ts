import { z } from "zod";
import { client } from "@/shared/api";

const healthSchema = z.object({
  status: z.string(),
  provider: z.string(),
});

export type HealthResponse = z.infer<typeof healthSchema>;

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await client.get("/health");
  return healthSchema.parse(data);
}
