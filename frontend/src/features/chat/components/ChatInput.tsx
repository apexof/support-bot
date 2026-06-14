import { type FC, useState, type KeyboardEvent } from "react";
import { Button } from "@/shared/ui";
import s from "./ChatInput.module.css";

interface Props {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export const ChatInput: FC<Props> = (props) => {
  const { onSend, onStop, isStreaming } = props;
  const [value, setValue] = useState("");

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={s.root}>
      <textarea
        className={s.textarea}
        value={value}
        onChange={(e) => { setValue(e.target.value); }}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
        placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
        rows={1}
      />
      {isStreaming ? (
        <Button variant="ghost" onClick={onStop}>Стоп</Button>
      ) : (
        <Button onClick={handleSend} disabled={!value.trim()}>Отправить</Button>
      )}
    </div>
  );
};
