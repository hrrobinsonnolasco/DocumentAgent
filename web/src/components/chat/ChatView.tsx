import { ChatInput } from '@/components/chat/ChatInput'
import { CitationModal } from '@/components/chat/CitationModal'
import { EmptyState } from '@/components/chat/EmptyState'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { IconButton } from '@/components/ui/IconButton'
import type { ChatStore } from '@/hooks/useChatStore'
import { PanelLeft, Settings } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ChatViewProps {
  store: ChatStore
}

export function ChatView({ store }: ChatViewProps) {
  const {
    activeConversation,
    sendMessage,
    settings,
    sidebarOpen,
    setSidebarOpen,
    setSettingsOpen,
    selectedCitation,
    setSelectedCitation,
  } = store

  const bottomRef = useRef<HTMLDivElement>(null)
  const isStreaming = activeConversation?.messages.some((m) => m.isStreaming)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages.length, isStreaming])

  const hasMessages = (activeConversation?.messages.length ?? 0) > 0

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="flex min-w-0 items-center gap-2">
          {!sidebarOpen && (
            <IconButton onClick={() => setSidebarOpen(true)} title="Mostrar historial">
              <PanelLeft className="h-4 w-4" />
            </IconButton>
          )}
          <h1 className="truncate text-sm font-medium">
            {activeConversation?.title ?? 'DocumentAgent'}
          </h1>
        </div>
        <IconButton onClick={() => setSettingsOpen(true)} title="Ajustes">
          <Settings className="h-4 w-4" />
        </IconButton>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        {!hasMessages ? (
          <EmptyState onSelectPrompt={sendMessage} />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-4">
              {activeConversation!.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  compact={settings.compactMode}
                  showCitationsInline={settings.showCitationsInline}
                  onCitationClick={setSelectedCitation}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        )}

        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>

      <CitationModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  )
}
