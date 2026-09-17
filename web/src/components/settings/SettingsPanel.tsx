import { IconButton } from '@/components/ui/IconButton'
import type { ChatStore } from '@/hooks/useChatStore'
import { Cpu, LogOut, X } from 'lucide-react'

interface SettingsPanelProps {
  store: ChatStore
}

export function SettingsPanel({ store }: SettingsPanelProps) {
  const {
    settingsOpen,
    setSettingsOpen,
    settings,
    updateSettings,
    logout,
    session,
  } = store

  if (!settingsOpen) return null

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar ajustes"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => setSettingsOpen(false)}
      />

      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l bg-[var(--color-surface-raised)] shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Ajustes</h2>
          <IconButton onClick={() => setSettingsOpen(false)}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <section className="mb-8">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
              Cuenta
            </h3>
            <div className="rounded-xl border bg-[var(--color-surface-overlay)] p-4">
              <p className="text-sm font-medium">{session?.displayName}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {settings.email}
              </p>
              <button
                type="button"
                onClick={logout}
                className="mt-3 flex items-center gap-2 text-xs text-[var(--color-danger)] transition hover:opacity-80"
              >
                <LogOut className="h-3.5 w-3.5" />
                Cerrar sesión
              </button>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
              Interfaz
            </h3>
            <div className="space-y-3">
              <ToggleRow
                label="Mostrar citas inline"
                description="Badges clicables bajo cada respuesta"
                checked={settings.showCitationsInline}
                onChange={(v) => updateSettings({ showCitationsInline: v })}
              />
              <ToggleRow
                label="Modo compacto"
                description="Menos espaciado entre mensajes"
                checked={settings.compactMode}
                onChange={(v) => updateSettings({ compactMode: v })}
              />
              <ToggleRow
                label="Streaming de respuestas"
                description="Mostrar tokens conforme llegan (S7–S8)"
                checked={settings.streamResponses}
                onChange={(v) => updateSettings({ streamResponses: v })}
              />
            </div>
          </section>

          <section className="mb-8">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
              Motor RAG
            </h3>
            <div className="rounded-xl border bg-[var(--color-surface-overlay)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[var(--color-accent)]" />
                <span className="text-sm font-medium">{settings.model}</span>
              </div>
              <label className="mb-1 block text-xs text-[var(--color-text-muted)]">
                Chunks recuperados (top-k)
              </label>
              <input
                type="range"
                min={4}
                max={10}
                value={settings.topK}
                onChange={(e) =>
                  updateSettings({ topK: Number(e.target.value) })
                }
                className="w-full accent-[var(--color-accent)]"
              />
              <p className="mt-1 text-right text-xs text-[var(--color-text-subtle)]">
                {settings.topK} chunks
              </p>
              <p className="mt-3 text-[10px] text-[var(--color-text-subtle)]">
                Configuración de solo lectura hasta integrar API FastAPI + Ollama
              </p>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">
              Acerca de
            </h3>
            <div className="rounded-xl border bg-[var(--color-surface-overlay)] p-4 text-xs text-[var(--color-text-muted)]">
              <p>DocumentAgent v0.1 — UI S7–S8</p>
              <p className="mt-1">
                RAG local · Qdrant + FastEmbed + Ollama/Qwen3
              </p>
            </div>
          </section>
        </div>
      </aside>
    </>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-[var(--color-surface-overlay)] px-4 py-3">
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-xs text-[var(--color-text-subtle)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-hover)]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}
