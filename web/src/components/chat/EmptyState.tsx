import { suggestedPrompts } from '@/data/mock'
import { FileSearch, Sparkles } from 'lucide-react'

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent-muted)]">
        <FileSearch className="h-8 w-8 text-[var(--color-accent)]" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        ¿Qué quieres consultar?
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-[var(--color-text-muted)]">
        Pregunta sobre reportes geotécnicos indexados. Cada respuesta incluirá
        citas con archivo y página verificables.
      </p>

      <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="group flex items-start gap-2 rounded-xl border bg-[var(--color-surface-overlay)] p-3 text-left text-sm transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]"
          >
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-subtle)] group-hover:text-[var(--color-accent)]" />
            <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]">
              {prompt}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
