import { type FC } from "react"
import { useChat } from "../hooks/useChat"
import { ChatHeader } from "./ChatHeader"
import { ChatInput } from "./ChatInput"
import s from "./ChatWidget.module.css"
import { MessageList } from "./MessageList"

export const ChatWidget: FC = () => {
  const { messages, isStreaming, error, sendMessage, stopStreaming } = useChat()

  return (
    <div className={s.root}>
      <ChatHeader />
      <MessageList messages={messages} error={error} />
      <ChatInput
        onSend={(content) => {
          void sendMessage(content)
        }}
        onStop={stopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  )
}
