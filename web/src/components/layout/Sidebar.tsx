import { IconButton } from '@/components/ui/IconButton'
import { cn, formatRelativeDate } from '@/lib/utils'
import type { ChatStore } from '@/hooks/useChatStore'
import type { Conversation } from '@/types/chat'
import {
  MessageSquarePlus,
  PanelLeftClose,
  Pin,
  Search,
  Settings,
  Trash2,
} from 'lucide-react'
import { useMemo } from 'react'

interface SidebarProps {
  store: ChatStore
}

function groupConversations(conversations: Conversation[]) {
  const pinned = conversations.filter((c) => c.pinned)
  const unpinned = conversations.filter((c) => !c.pinned)

  const groups = new Map<string, Conversation[]>()
  for (const conv of unpinned) {
    const label = formatRelativeDate(conv.updatedAt)
    const list = groups.get(label) ?? []
    list.push(conv)
    groups.set(label, list)
  }

  return { pinned, groups: Array.from(groups.entries()) }
}

export function Sidebar({ store }: SidebarProps) {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    deleteConversation,
    togglePin,
    setSidebarOpen,
    setSettingsOpen,
    searchQuery,
    setSearchQuery,
    session,
  } = store

  const { pinned, groups } = useMemo(
    () => groupConversations(conversations),
    [conversations],
  )

  const renderItem = (conv: Conversation) => {
    const active = conv.id === activeConversationId
    return (
      <div
        key={conv.id}
        className={cn(
          'group relative flex items-center rounded-lg transition-colors',
          active
            ? 'bg-[var(--color-surface-hover)]'
            : 'hover:bg-[var(--color-surface-hover)]/60',
        )}
      >
        <button
          type="button"
          onClick={() => setActiveConversationId(conv.id)}
          className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left"
        >
          <span className="truncate text-sm text-[var(--color-text)]">
            {conv.title}
          </span>
        </button>
        <div className="absolute right-1 flex opacity-0 transition group-hover:opacity-100">
          <IconButton
            size="sm"
            onClick={() => togglePin(conv.id)}
            title={conv.pinned ? 'Desfijar' : 'Fijar'}
          >
            <Pin
              className={cn(
                'h-3.5 w-3.5',
                conv.pinned && 'fill-current text-[var(--color-accent)]',
              )}
            />
          </IconButton>
          <IconButton
            size="sm"
            onClick={() => deleteConversation(conv.id)}
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>
    )
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r bg-[var(--color-surface-raised)]">
      <div className="flex items-center justify-between border-b px-3 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">DocumentAgent</p>
          <p className="truncate text-xs text-[var(--color-text-subtle)]">
            {session?.displayName}
          </p>
        </div>
        <IconButton onClick={() => setSidebarOpen(false)} title="Ocultar panel">
          <PanelLeftClose className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="space-y-2 p-3">
        <button
          type="button"
          onClick={createConversation}
          className="flex h-9 w-full items-center gap-2 rounded-lg border border-dashed px-3 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Nueva conversación
        </button>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conversaciones…"
            className="h-8 w-full rounded-lg border bg-[var(--color-surface)] pl-8 pr-3 text-xs outline-none transition focus:border-[var(--color-border-strong)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {pinned.length > 0 && (
          <div className="mb-3">
            <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
              Fijadas
            </p>
            {pinned.map(renderItem)}
          </div>
        )}

        {groups.map(([label, items]) => (
          <div key={label} className="mb-3">
            <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
              {label}
            </p>
            {items.map(renderItem)}
          </div>
        ))}

        {conversations.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-[var(--color-text-subtle)]">
            Sin conversaciones
          </p>
        )}
      </div>

      <div className="border-t p-2">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
        >
          <Settings className="h-4 w-4" />
          Ajustes
        </button>
      </div>
    </aside>
  )
}
