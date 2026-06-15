import { apiClient } from "@/shared/api"
import { z } from "zod"
import { type UploadedKnowledgeBase } from "../types"

const schema = z.object({
  filename: z.string(),
  size: z.number(),
})

export async function uploadKnowledgeBase(file: File): Promise<UploadedKnowledgeBase> {
  const formData = new FormData()
  formData.append("file", file)

  const data = await apiClient<unknown>("/knowledge-base", {
    method: "POST",
    body: formData,
  })

  return schema.parse(data)
}
