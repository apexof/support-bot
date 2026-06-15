import { type Message } from "@/entities/message"
import { env } from "@/shared/config"
import { EventSourceParserStream } from "eventsource-parser/stream"

interface ChatRequest {
  messages: Message[]
  provider?: "ollama" | "claude"
}

export async function* streamChat(
  request: ChatRequest,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const response = await fetch(`${env.VITE_API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${String(response.status)}`)
  }

  if (!response.body) {
    throw new Error("Response body is empty")
  }

  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())
    .getReader()

  try {
    for (;;) {
      const { done, value: event } = await reader.read()
      if (done) break
      if (event.event === "error") {
        const parsed = JSON.parse(event.data) as { message: string }
        throw new Error(parsed.message)
      }
      if (event.data === "[DONE]") return
      yield JSON.parse(event.data) as string
    }
  } finally {
    reader.releaseLock()
  }
}
