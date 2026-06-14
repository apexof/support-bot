import { type FC, useEffect, useRef } from "react";
import { type Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import s from "./MessageList.module.css";

interface Props {
  messages: Message[];
}

export const MessageList: FC<Props> = (props) => {
  const { messages } = props;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={s.root}>
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
