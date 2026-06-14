import { env } from "@/shared/config"

export async function deleteKnowledgeBase(): Promise<void> {
  const response = await fetch(`${env.VITE_API_URL}/knowledge-base`, { method: "DELETE" })
  if (!response.ok) throw new Error(`Failed to delete knowledge base: ${String(response.status)}`)
}
