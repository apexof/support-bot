import { MessageBubble, type Message } from "@/entities/message"
import { type FC, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import s from "./MessageList.module.css"

interface Props {
  messages: Message[]
  isStreaming: boolean
  error: string | null
}

export const MessageList: FC<Props> = (props) => {
  const { messages, isStreaming, error } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const { ref: bottomRef, inView } = useInView()

  useEffect(() => {
    if (!inView || !rootRef.current) return
    rootRef.current.scrollTop = rootRef.current.scrollHeight
  }, [messages, error, inView])

  return (
    <div className={s.root} ref={rootRef}>
      {messages.map((message, index) => {
        const isLast = index === messages.length - 1
        const isLoading = isLast && isStreaming && message.content === ""
        return <MessageBubble key={index} message={message} isLoading={isLoading} />
      })}
      {error && (
        <MessageBubble
          message={{ role: "assistant", content: error }}
          isError
        />
      )}
      <div ref={bottomRef} />
    </div>
  )
}
