import { getErrorMessage } from "@/shared/api"
import { useRef, useState } from "react"
import { streamChat } from "../api"
import { type Message } from "../types"

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function sendMessage(content: string) {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const userMessage: Message = { role: "user", content }
    const nextMessages: Message[] = [...messages, userMessage]

    setMessages([...nextMessages, { role: "assistant", content: "" }])
    setIsStreaming(true)
    setError(null)

    try {
      for await (const chunk of streamChat({ messages: nextMessages }, controller.signal)) {
        setMessages((prev) => {
          const last = prev.at(-1)
          if (!last) return prev
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }]
        })
      }
    } catch (err) {
      if (controller.signal.aborted) return
      setError(getErrorMessage(err))
      setMessages(nextMessages)
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  function stopStreaming() {
    abortRef.current?.abort()
  }

  return { messages, isStreaming, error, sendMessage, stopStreaming }
}
