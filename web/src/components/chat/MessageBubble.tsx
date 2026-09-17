import { CitationBadge } from '@/components/chat/CitationBadge'
import { cn } from '@/lib/utils'
import type { Message } from '@/types/chat'
import type { Citation } from '@/types/chat'
import { Bot, User } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  compact?: boolean
  showCitationsInline?: boolean
  onCitationClick?: (citation: Citation) => void
}

function renderMarkdownLite(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[var(--color-text)]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part === '\n') return <br key={i} />
    return part
  })
}

export function MessageBubble({
  message,
  compact,
  showCitationsInline = true,
  onCitationClick,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
        compact ? 'py-2' : 'py-4',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          isUser
            ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
            : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]',
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      <div
        className={cn(
          'min-w-0 max-w-[85%] space-y-2',
          isUser ? 'items-end text-right' : 'items-start',
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-surface-overlay)] text-[var(--color-text)]',
          )}
        >
          {message.isStreaming ? (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-text-muted)]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-text-muted)] [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-text-muted)] [animation-delay:300ms]" />
            </span>
          ) : (
            <span className="whitespace-pre-wrap">
              {renderMarkdownLite(message.content)}
            </span>
          )}
        </div>

        {!isUser &&
          showCitationsInline &&
          message.citations &&
          message.citations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {message.citations.map((c) => (
                <CitationBadge
                  key={c.id}
                  citation={c}
                  compact={compact}
                  onClick={() => onCitationClick?.(c)}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
