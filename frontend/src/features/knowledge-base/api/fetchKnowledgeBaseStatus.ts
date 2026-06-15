import { apiClient } from "@/shared/api"
import { z } from "zod"
import { type KnowledgeBaseStatus } from "../types"

const schema = z.object({
  filename: z.string().nullable(),
  size: z.number().nullable(),
})

export async function fetchKnowledgeBaseStatus(): Promise<KnowledgeBaseStatus> {
  return schema.parse(await apiClient("/knowledge-base"))
}
