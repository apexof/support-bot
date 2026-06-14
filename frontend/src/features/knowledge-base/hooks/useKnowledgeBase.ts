import { getErrorMessage } from "@/shared/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteKnowledgeBase, fetchKnowledgeBaseStatus, uploadKnowledgeBase } from "../api"

const QUERY_KEY = ["knowledge-base-status"]

export function useKnowledgeBase() {
  const queryClient = useQueryClient()

  const { data: status } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchKnowledgeBaseStatus,
  })

  const uploadMutation = useMutation({
    mutationFn: uploadKnowledgeBase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteKnowledgeBase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  return {
    status,
    isUploading: uploadMutation.isPending,
    error: getErrorMessage(uploadMutation.error ?? deleteMutation.error),
    upload: uploadMutation.mutate,
    remove: deleteMutation.mutate,
  }
}
