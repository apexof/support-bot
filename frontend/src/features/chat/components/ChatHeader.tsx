import { KnowledgeBaseUpload } from "@/features/knowledge-base"
import { BotMessageSquare } from "lucide-react"
import { type FC } from "react"
import s from "./ChatHeader.module.css"

export const ChatHeader: FC = () => {
  return (
    <header className={s.root}>
      <div className={s.brand}>
        <div className={s.avatar}>
          <BotMessageSquare size={20} />
        </div>
        <div>
          <h1 className={s.title}>Support Bot</h1>
          <p className={s.subtitle}>Отвечаю на вопросы по вашей базе знаний</p>
        </div>
      </div>
      <KnowledgeBaseUpload />
    </header>
  )
}
