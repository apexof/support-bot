import { type FC } from "react";
import { useChat } from "../hooks/useChat";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import s from "./ChatWidget.module.css";

export const ChatWidget: FC = () => {
  const { messages, isStreaming, error, sendMessage, stopStreaming } = useChat();

  return (
    <div className={s.root}>
      <header className={s.header}>
        <h1>Support Bot</h1>
      </header>
      <MessageList messages={messages} />
      {error && <div className={s.error}>{error}</div>}
      <ChatInput
        onSend={(content) => { void sendMessage(content); }}
        onStop={stopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
};
