import { ApiError } from "./errors"

export function getErrorMessage(error: null | undefined): null
export function getErrorMessage(error: unknown): string
export function getErrorMessage(error: unknown): string | null {
  if (error == null) return null
  if (error instanceof ApiError) {
    return error.message || `Request failed: ${String(error.status)}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return "Unknown error"
}
