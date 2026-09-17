import { LoginPage } from '@/components/auth/LoginPage'
import { AppShell } from '@/components/layout/AppShell'
import { useChatStore } from '@/hooks/useChatStore'

function App() {
  const store = useChatStore()

  if (!store.session) {
    return <LoginPage onLogin={store.login} />
  }

  return <AppShell store={store} />
}

export default App
