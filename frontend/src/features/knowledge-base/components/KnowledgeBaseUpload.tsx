import { cn, formatBytes } from "@/shared/lib"
import { FileText, Upload, X } from "lucide-react"
import { type ChangeEvent, type DragEvent, type FC, useRef, useState } from "react"
import { useKnowledgeBase } from "../hooks/useKnowledgeBase"
import s from "./KnowledgeBaseUpload.module.css"

export const KnowledgeBaseUpload: FC = () => {
  const { status, isUploading, uploadError, upload, remove } = useKnowledgeBase()
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ""
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  if (status?.filename) {
    return (
      <div className={s.loaded}>
        <FileText size={14} className={s.fileIcon} />
        <span className={s.fileName}>{status.filename}</span>
        {status.size !== null && <span className={s.fileSize}>{formatBytes(status.size)}</span>}
        <button className={s.removeBtn} onClick={() => { remove() }} aria-label="Remove knowledge base">
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(s.dropzone, isDragging && s.dragging, isUploading && s.uploading)}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => { setIsDragging(false) }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") inputRef.current?.click() }}
    >
      <input ref={inputRef} type="file" accept=".txt,.md" className={s.hiddenInput} onChange={handleChange} />
      {isUploading ? (
        <span className={s.hint}>Загружаю...</span>
      ) : (
        <>
          <Upload size={13} className={s.icon} />
          <span className={s.hint}>Загрузить базу знаний (.txt, .md)</span>
        </>
      )}
      {uploadError && <span className={s.error}>{uploadError}</span>}
    </div>
  )
}
