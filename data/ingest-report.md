# Informe de ingesta (S2)

Fecha: 2026-09-09
Entrada: `data/raw`
Chunks: `data/chunks/all.jsonl`

- Documentos procesados: **6**
- Páginas totales: **500**
- Páginas indexables: **493** (98.6%)
- Páginas descartadas (< 40 chars): **7**
- Chunks generados: **535**
- Corpus usable sin OCR: **98.6%** de las páginas

## Por archivo

| Archivo | Páginas | Indexables | Descartadas | Chunks | Título |
|---|---:|---:|---:|---:|---|
| `01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf` | 30 | 30 | 0 | 30 | 01.-Etapas-del-Proceso-Productivo-de-una-Mina |
| `2001-Proyectos_de_inversion_minera.pdf` | 158 | 154 | 4 | 156 | Proyectos de inversión minera y prospectos en estudio - Boletin Especial |
| `7917586-cpem-2026.pdf` | 108 | 108 | 0 | 115 | 7917586-cpem-2026 |
| `8277304-cpim-2026.pdf` | 109 | 108 | 1 | 122 | 8277304-cpim-2026 |
| `mineria-cobre-molibdeno-arequipa-minera-cerro-verde-peru-reporte-2017.pdf` | 46 | 46 | 0 | 64 | mineria-cobre-molibdeno-arequipa-minera-cerro-verde-peru-reporte-2017 |
| `pwc-mine-2025-v-espanol-cap-peruano.pdf` | 49 | 47 | 2 | 48 | pwc-mine-2025-v-espanol-cap-peruano |

## Fallos

- Ninguno.

## Notas

- Chunk ≈400–800 tokens (estimado chars/4), overlap en páginas largas, un chunk no cruza de página.
- Cada chunk: `{doc_id, filename, title, date, page, text}`.
- DOCX (si aparece) no tiene página real: se guarda como página 1.
