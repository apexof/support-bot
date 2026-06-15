import { ChatInput, MessageList, useChat } from "@/features/chat"
import { type FC } from "react"
import { Header } from "./Header"
import s from "./ChatWidget.module.css"

export const ChatWidget: FC = () => {
  const { messages, isStreaming, error, sendMessage, stopStreaming } = useChat()

  return (
    <div className={s.root}>
      <Header />
      <MessageList messages={messages} isStreaming={isStreaming} error={error} />
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
