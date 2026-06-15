import { type FC } from "react"
import s from "./TypingIndicator.module.css"

export const TypingIndicator: FC = () => {
  return (
    <span className={s.root}>
      <span />
      <span />
      <span />
    </span>
  )
}
