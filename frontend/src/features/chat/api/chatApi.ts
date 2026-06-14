import { env } from "@/shared/config"
import { EventSourceParserStream } from "eventsource-parser/stream"
import { type Message } from "../types"

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

  const eventStream = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())

  for await (const event of eventStream) {
    if (event.event === "error") {
      const parsed = JSON.parse(event.data) as { message: string }
      throw new Error(parsed.message)
    }
    if (event.data === "[DONE]") return
    yield event.data
  }
}
