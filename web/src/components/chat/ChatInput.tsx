import { ArrowUp, Paperclip } from 'lucide-react'
import { useRef, useState } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = 'Pregunta sobre reportes geotécnicos…',
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (!value.trim() || disabled) return
    onSend(value)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="border-t bg-[var(--color-surface)] px-4 py-4">
      <div className="mx-auto max-w-3xl">
        <div className="relative rounded-2xl border bg-[var(--color-surface-overlay)] shadow-lg">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder={placeholder}
            className="max-h-40 min-h-[52px] w-full resize-none bg-transparent px-4 py-3.5 pr-24 text-sm outline-none placeholder:text-[var(--color-text-subtle)] disabled:opacity-50"
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <button
              type="button"
              disabled
              title="Adjuntar (próximamente)"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-subtle)] opacity-40"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim() || disabled}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-text)] text-[var(--color-surface)] transition hover:opacity-90 disabled:opacity-30"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-[var(--color-text-subtle)]">
          Respuestas con cita obligatoria · Enter envía · Shift+Enter nueva línea
        </p>
      </div>
    </div>
  )
}
