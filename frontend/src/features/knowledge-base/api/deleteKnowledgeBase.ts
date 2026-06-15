import { apiClient } from "@/shared/api"

export async function deleteKnowledgeBase(): Promise<void> {
  await apiClient("/knowledge-base", { method: "DELETE" })
}
