import { useCallback, useMemo, useState } from 'react'
import { mockConversations, defaultSettings } from '@/data/mock'
import type {
  Citation,
  Conversation,
  Message,
  UserSession,
  UserSettings,
} from '@/types/chat'

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export function useChatStore() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    mockConversations[0]?.id ?? null,
  )
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  )

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return conversations
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.messages.some((m) => m.content.toLowerCase().includes(query)),
    )
  }, [conversations, searchQuery])

  const login = useCallback((username: string) => {
    setSession({
      username,
      displayName: username.charAt(0).toUpperCase() + username.slice(1),
    })
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    setSettingsOpen(false)
  }, [])

  const createConversation = useCallback(() => {
    const newConv: Conversation = {
      id: createId('conv'),
      title: 'Nueva conversación',
      messages: [],
      updatedAt: new Date(),
    }
    setConversations((prev) => [newConv, ...prev])
    setActiveConversationId(newConv.id)
    return newConv.id
  }, [])

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id)
        if (activeConversationId === id) {
          setActiveConversationId(next[0]?.id ?? null)
        }
        return next
      })
    },
    [activeConversationId],
  )

  const togglePin = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    )
  }, [])

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return

      let convId = activeConversationId
      if (!convId) {
        convId = createConversation()
      }

      const userMessage: Message = {
        id: createId('msg'),
        role: 'user',
        content: content.trim(),
        createdAt: new Date(),
      }

      const assistantMessage: Message = {
        id: createId('msg'),
        role: 'assistant',
        content: '',
        isStreaming: true,
        createdAt: new Date(),
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c
          const isFirst = c.messages.length === 0
          return {
            ...c,
            title: isFirst
              ? content.trim().slice(0, 42) + (content.length > 42 ? '…' : '')
              : c.title,
            updatedAt: new Date(),
            messages: [...c.messages, userMessage, assistantMessage],
          }
        }),
      )

      // Simula respuesta mock (integración IA vendrá después)
      setTimeout(() => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessage.id
                  ? {
                      ...m,
                      isStreaming: false,
                      content:
                        'Esta es una respuesta de demostración. La integración con el motor RAG (Ollama + Qdrant) se conectará en la siguiente fase.\n\nPor ahora puedes explorar el historial y las citas en las conversaciones de ejemplo.',
                      citations: [
                        {
                          id: createId('cit'),
                          filename: '7917586-cpem-2026.pdf',
                          page: 5,
                          excerpt:
                            'Fragmento de ejemplo — la cita real vendrá del contexto recuperado.',
                        },
                      ],
                    }
                  : m,
              ),
            }
          }),
        )
      }, 1200)
    },
    [activeConversationId, createConversation],
  )

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return {
    session,
    login,
    logout,
    conversations: filteredConversations,
    allConversations: conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    deleteConversation,
    togglePin,
    sendMessage,
    settings,
    updateSettings,
    sidebarOpen,
    setSidebarOpen,
    settingsOpen,
    setSettingsOpen,
    selectedCitation,
    setSelectedCitation,
    searchQuery,
    setSearchQuery,
  }
}

export type ChatStore = ReturnType<typeof useChatStore>
