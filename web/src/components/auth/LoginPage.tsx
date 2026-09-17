import { FileSearch, Lock, User } from 'lucide-react'
import { useState } from 'react'

interface LoginPageProps {
  onLogin: (username: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('ingeniero')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(username.trim() || 'ingeniero')
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-muted)]">
            <FileSearch className="h-7 w-7 text-[var(--color-accent)]" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            DocumentAgent
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Asistente geotécnico con citas verificables · acceso local
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl border p-6 shadow-2xl"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]"
              >
                Usuario
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]" />
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 w-full rounded-lg border bg-[var(--color-surface)] pl-10 pr-3 text-sm outline-none transition focus:border-[var(--color-border-strong)] focus:ring-1 focus:ring-[var(--color-accent-muted)]"
                  placeholder="ingeniero"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border bg-[var(--color-surface)] pl-10 pr-3 text-sm outline-none transition focus:border-[var(--color-border-strong)] focus:ring-1 focus:ring-[var(--color-accent-muted)]"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 h-10 w-full rounded-lg bg-[var(--color-text)] text-sm font-medium text-[var(--color-surface)] transition hover:opacity-90"
          >
            Ingresar
          </button>

          <p className="mt-4 text-center text-xs text-[var(--color-text-subtle)]">
            Vista de demostración · JWT y API se integrarán en S7–S8
          </p>
        </form>
      </div>
    </div>
  )
}
