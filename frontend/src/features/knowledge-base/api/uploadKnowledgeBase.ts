import { env } from "@/shared/config"
import { z } from "zod"

const schema = z.object({
  filename: z.string(),
  size: z.number(),
})

export async function uploadKnowledgeBase(file: File): Promise<z.infer<typeof schema>> {
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

  return schema.parse(await response.json())
}
