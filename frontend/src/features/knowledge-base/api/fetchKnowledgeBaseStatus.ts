import { env } from "@/shared/config"
import { z } from "zod"
import { type KnowledgeBaseStatus } from "../types"

const schema = z.object({
  filename: z.string().nullable(),
  size: z.number().nullable(),
})

export async function fetchKnowledgeBaseStatus(): Promise<KnowledgeBaseStatus> {
  const response = await fetch(`${env.VITE_API_URL}/knowledge-base`)
  if (!response.ok) throw new Error("Failed to fetch knowledge base status")
  return schema.parse(await response.json())
}
