import { ApiError } from "./errors"

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || `Request failed: ${String(error.status)}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return "Unknown error"
}
