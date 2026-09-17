import { IconButton } from '@/components/ui/IconButton'
import type { Citation } from '@/types/chat'
import { ExternalLink, FileText, X } from 'lucide-react'

interface CitationModalProps {
  citation: Citation | null
  onClose: () => void
}

export function CitationModal({ citation, onClose }: CitationModalProps) {
  if (!citation) return null

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar cita"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-[var(--color-surface-raised)] p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-citation-muted)]">
              <FileText className="h-5 w-5 text-[var(--color-citation)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Cita verificable</h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Página {citation.page}
              </p>
            </div>
          </div>
          <IconButton onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <p className="mb-2 truncate text-sm font-medium">{citation.filename}</p>

        <blockquote className="rounded-xl border bg-[var(--color-surface-overlay)] p-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
          “{citation.excerpt}”
        </blockquote>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            disabled
            title="Abrir PDF (próximamente)"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-[var(--color-text-muted)] opacity-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir en visor PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--color-text)] px-3 py-2 text-xs font-medium text-[var(--color-surface)]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  )
}
