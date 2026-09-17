import { cn } from '@/lib/utils'
import type { Citation } from '@/types/chat'
import { FileText } from 'lucide-react'

interface CitationBadgeProps {
  citation: Citation
  onClick?: () => void
  compact?: boolean
}

export function CitationBadge({
  citation,
  onClick,
  compact,
}: CitationBadgeProps) {
  const shortName = citation.filename.replace(/\.pdf$/i, '').slice(0, 28)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-left transition',
        'border-[var(--color-citation-muted)] bg-[var(--color-citation-muted)] text-[var(--color-citation)]',
        'hover:border-[var(--color-citation)]/40 hover:bg-[var(--color-citation)]/20',
        compact ? 'text-[10px]' : 'text-xs',
      )}
      title={`${citation.filename} · pág. ${citation.page}`}
    >
      <FileText className="h-3 w-3 shrink-0" />
      <span className="truncate font-medium">{shortName}</span>
      <span className="shrink-0 opacity-70">p.{citation.page}</span>
    </button>
  )
}
