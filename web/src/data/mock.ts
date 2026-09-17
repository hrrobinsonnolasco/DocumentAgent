import type { Conversation, UserSettings } from '@/types/chat'

export const defaultSettings: UserSettings = {
  displayName: 'Ingeniero',
  email: 'ingeniero@planta.local',
  showCitationsInline: true,
  compactMode: false,
  streamResponses: true,
  topK: 6,
  model: 'Qwen3 14B Q4 (Ollama)',
}

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Cartera CPEM 2026',
    pinned: true,
    updatedAt: new Date(),
    messages: [
      {
        id: 'm1',
        role: 'user',
        content:
          '¿Cuántos proyectos y qué inversión tiene la Cartera de Exploración Minera 2026?',
        createdAt: new Date(Date.now() - 3_600_000),
      },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'Según la Cartera de Exploración Minera 2026 (CPEM), hay **69 proyectos** con una inversión total de **US$ 757 millones**.',
        citations: [
          {
            id: 'c1',
            filename: '7917586-cpem-2026.pdf',
            page: 5,
            excerpt:
              'La Cartera de Exploración Minera 2026 comprende 69 proyectos con una inversión total de US$ 757 millones.',
          },
        ],
        createdAt: new Date(Date.now() - 3_500_000),
      },
      {
        id: 'm3',
        role: 'user',
        content: '¿Qué fecha de consulta usa la tabla?',
        createdAt: new Date(Date.now() - 3_000_000),
      },
      {
        id: 'm4',
        role: 'assistant',
        content: 'La tabla de la CPEM 2026 usa fecha de consulta **17/02/2026**.',
        citations: [
          {
            id: 'c2',
            filename: '7917586-cpem-2026.pdf',
            page: 8,
            excerpt: 'Fecha de consulta: 17/02/2026',
          },
        ],
        createdAt: new Date(Date.now() - 2_900_000),
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Cerro Verde — producción 2017',
    updatedAt: new Date(Date.now() - 86_400_000),
    messages: [
      {
        id: 'm5',
        role: 'user',
        content:
          '¿Qué produjo Cerro Verde en 2017 (concentrado Cu, Mo y cátodos)?',
        createdAt: new Date(Date.now() - 90_000_000),
      },
      {
        id: 'm6',
        role: 'assistant',
        content:
          'En 2017 Cerro Verde produjo:\n\n- **2.007.226 TM** de concentrado de cobre\n- **23.018 TM** de concentrado de molibdeno\n- **37.276 TM** de cátodos Grado AA LME',
        citations: [
          {
            id: 'c3',
            filename:
              'mineria-cobre-molibdeno-arequipa-minera-cerro-verde-peru-reporte-2017.pdf',
            page: 3,
            excerpt:
              'Producción 2017: 2.007.226 TM conc. Cu; 23.018 TM conc. Mo; 37.276 TM cátodos Grado AA LME.',
          },
        ],
        createdAt: new Date(Date.now() - 89_500_000),
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Factor de seguridad talud norte',
    updatedAt: new Date(Date.now() - 172_800_000),
    messages: [
      {
        id: 'm7',
        role: 'user',
        content:
          '¿Cuál fue el factor de seguridad mínimo del talud norte en el último informe geotécnico?',
        createdAt: new Date(Date.now() - 180_000_000),
      },
      {
        id: 'm8',
        role: 'assistant',
        content:
          'No encontré evidencia de ese dato en los documentos indexados. El factor de seguridad del talud norte **no está en el corpus** actual.',
        createdAt: new Date(Date.now() - 179_500_000),
      },
    ],
  },
  {
    id: 'conv-4',
    title: 'Ley de recursos y reservas Chile',
    updatedAt: new Date(Date.now() - 604_800_000),
    messages: [
      {
        id: 'm9',
        role: 'user',
        content:
          '¿Qué ley chilena formalizó el marco de certificación de recursos y reservas?',
        createdAt: new Date(Date.now() - 610_000_000),
      },
      {
        id: 'm10',
        role: 'assistant',
        content:
          'La **Ley 20.235**, promulgada en **diciembre de 2007**, formalizó el marco de certificación de recursos y reservas en Chile.',
        citations: [
          {
            id: 'c4',
            filename: '01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf',
            page: 10,
            excerpt:
              'Ley 20.235, diciembre de 2007 — marco de certificación de recursos y reservas.',
          },
        ],
        createdAt: new Date(Date.now() - 609_000_000),
      },
    ],
  },
]

export const suggestedPrompts = [
  '¿Cuántos proyectos tiene la CPEM 2026?',
  '¿Qué produjo Cerro Verde en 2017?',
  '¿Cuál es el CAPEX de Optimización Cerro Verde?',
  '¿Qué porcentaje de concesiones estaba en explotación según INGEMMET 2001?',
]
