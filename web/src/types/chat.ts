export interface Citation {
  id: string
  filename: string
  page: number
  excerpt: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  isStreaming?: boolean
  createdAt: Date
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  updatedAt: Date
  pinned?: boolean
}

export interface UserSettings {
  displayName: string
  email: string
  showCitationsInline: boolean
  compactMode: boolean
  streamResponses: boolean
  topK: number
  model: string
}

export interface UserSession {
  username: string
  displayName: string
}
