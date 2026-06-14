import { type FC, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { type Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import s from "./MessageList.module.css";

interface Props {
  messages: Message[];
}

export const MessageList: FC<Props> = (props) => {
  const { messages } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const { ref: bottomRef, inView } = useInView();

  useEffect(() => {
    if (!inView || !rootRef.current) return;
    rootRef.current.scrollTop = rootRef.current.scrollHeight;
  }, [messages, inView]);

  return (
    <div className={s.root} ref={rootRef}>
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
