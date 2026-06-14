import { isAxiosError } from "axios";
import { z } from "zod";

const apiErrorSchema = z.object({ detail: z.string() });

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const parsed = apiErrorSchema.safeParse(error.response?.data);
    return parsed.success ? parsed.data.detail : error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}
