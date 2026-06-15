import { MessageBubble, type Message } from "@/entities/message"
import { type FC, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import s from "./MessageList.module.css"

interface Props {
  messages: Message[]
  error: string | null
}

export const MessageList: FC<Props> = (props) => {
  const { messages, error } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const { ref: bottomRef, inView } = useInView()

  useEffect(() => {
    if (!inView || !rootRef.current) return
    rootRef.current.scrollTop = rootRef.current.scrollHeight
  }, [messages, error, inView])

  return (
    <div className={s.root} ref={rootRef}>
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
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
