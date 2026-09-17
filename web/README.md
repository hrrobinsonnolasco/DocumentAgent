# DocumentAgent — Chat Web UI (S7–S8)

Interfaz premium tipo Cursor para consultar reportes geotécnicos. **Solo vistas** con datos mock; la integración con API/RAG/Ollama viene en la siguiente fase.

## Vistas incluidas

- **Login** — pantalla de acceso (mock, sin JWT real)
- **Chat** — mensajes usuario/asistente, indicador de streaming
- **Citas** — badges clicables con archivo + página + extracto
- **Historial** — sidebar con búsqueda, fijar y eliminar conversaciones
- **Ajustes** — cuenta, interfaz, motor RAG (top-k, modelo)

## Desarrollo

```bash
cd web
npm install
npm run dev
```

Abre http://localhost:5173 — usuario cualquiera, contraseña opcional.

## Build

```bash
npm run build
npm run preview
```

## Estructura

```
src/
  components/
    auth/       LoginPage
    chat/       ChatView, MessageBubble, Citations, Input
    layout/     AppShell, Sidebar
    settings/   SettingsPanel
  data/mock.ts  Conversaciones de ejemplo (set dorado)
  hooks/        useChatStore (estado local)
```
