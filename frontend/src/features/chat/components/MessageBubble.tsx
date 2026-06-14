import { cn } from "@/shared/lib"
import { type FC } from "react"
import { type Message } from "../types"
import s from "./MessageBubble.module.css"

interface Props {
  message: Message
  isError?: boolean
}

export const MessageBubble: FC<Props> = (props) => {
  const { message, isError = false } = props

  return (
    <div className={cn(s.row, s[message.role])}>
      <div className={cn(s.bubble, s[message.role], isError && s.error)}>
        {isError && <span className={s.errorIcon}>⚠</span>}
        {message.content}
      </div>
    </div>
  )
}
