import { cn } from "@/shared/lib"
import { type FC } from "react"
import { type Message } from "../types"
import s from "./MessageBubble.module.css"

interface Props {
  message: Message
}

export const MessageBubble: FC<Props> = (props) => {
  const { message } = props

  return (
    <div className={cn(s.row, s[message.role])}>
      <div className={cn(s.bubble, s[message.role])}>{message.content}</div>
    </div>
  )
}
