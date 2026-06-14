import { env } from "@/shared/config"
import { z } from "zod"

const uploadResponseSchema = z.object({
  filename: z.string(),
  size: z.number(),
})

const statusResponseSchema = z.object({
  filename: z.string().nullable(),
  size: z.number().nullable(),
})

export type KnowledgeBaseStatus = z.infer<typeof statusResponseSchema>

export async function uploadKnowledgeBase(file: File): Promise<z.infer<typeof uploadResponseSchema>> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${env.VITE_API_URL}/knowledge-base`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const body = (await response.json()) as { detail?: string }
    throw new Error(body.detail ?? `Upload failed: ${String(response.status)}`)
  }

  return uploadResponseSchema.parse(await response.json())
}

export async function fetchKnowledgeBaseStatus(): Promise<KnowledgeBaseStatus> {
  const response = await fetch(`${env.VITE_API_URL}/knowledge-base`)
  if (!response.ok) throw new Error("Failed to fetch knowledge base status")
  return statusResponseSchema.parse(await response.json())
}

export async function deleteKnowledgeBase(): Promise<void> {
  await fetch(`${env.VITE_API_URL}/knowledge-base`, { method: "DELETE" })
}
