import { ChatView } from '@/components/chat/ChatView'
import { Sidebar } from '@/components/layout/Sidebar'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import type { ChatStore } from '@/hooks/useChatStore'

interface AppShellProps {
  store: ChatStore
}

export function AppShell({ store }: AppShellProps) {
  const { sidebarOpen } = store

  return (
    <div className="flex h-full overflow-hidden">
      {sidebarOpen && <Sidebar store={store} />}
      <ChatView store={store} />
      <SettingsPanel store={store} />
    </div>
  )
}
