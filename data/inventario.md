# Inventario de documentos (S1)

Revisado: 2026-09-09  
Carpeta: `data/raw/` (entra al PoC) · `data/rejected/` (no se indexa)

## Entran al PoC (texto extraíble)

| # | Hecho | Archivo | Tipo | Páginas | Nativo / escaneado | Dueño / origen | ¿Entra? |
|---|---|---|---|---|---|---|---|
| 1 | [x] | `01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf` | PDF | 30 | nativo | SONAMI / Antofagasta Minerals (2012) | sí |
| 2 | [x] | `2001-Proyectos_de_inversion_minera.pdf` | PDF | 158 | nativo | INGEMMET, Perú (2001) | sí |
| 3 | [x] | `7917586-cpem-2026.pdf` | PDF | 108 | nativo | MINEM, Cartera exploración 2026 | sí |
| 4 | [x] | `8277304-cpim-2026.pdf` | PDF | 109 | nativo | MINEM, Cartera inversión 2026 | sí |
| 5 | [x] | `mineria-cobre-molibdeno-arequipa-minera-cerro-verde-peru-reporte-2017.pdf` | PDF | 46 | nativo | Sociedad Minera Cerro Verde (2017) | sí |
| 6 | [x] | `pwc-mine-2025-v-espanol-cap-peruano.pdf` | PDF | 49 | nativo | PwC Mine 2025 (cap. Perú) | sí |

## Apartados (no indexar)

| # | Hecho | Archivo | Tipo | Motivo |
|---|---|---|---|---|
| 1 | [x] | `Policy-brief_Alvaro-Paredes_page-0001-453x640.jpg` | JPG | imagen, no documento |
| 2 | [x] | `mini_magick20190706-7082-1nkcq0l.png` | PNG | imagen, no documento |

## Conteo (cierre S1)

- [x] Total archivos revisados: **8**
- [x] Nativos (PDF texto): **6** → usable sin OCR: **100% de los PDF**
- [x] Escaneados / imagen apartados: **2**
- [x] Entran al PoC: **6** (500 páginas en total)

## Nota de alcance

Estos no son informes geotécnicos de talud/instrumentación. Son **carteras MINEM, un curso SONAMI, INGEMMET 2001, sostenibilidad Cerro Verde y PwC**. Sirven para probar el pipeline (ingesta → citas). El set dorado está armado **sobre estos archivos**, no sobre FS de taludes.

Cuando haya reportes reales de geotecnia, se suman a `raw/` y se agregan preguntas.
