# Evaluación retrieval (S3)

Modelo: `intfloat/multilingual-e5-large` · colección `documents` · top-5
Recall@5: **9/10 = 90%**

Hit = mismo archivo **y** misma página que el set dorado.

| # | Hit | Rank | Pregunta | Esperado | Top resultados |
|---|---|---:|---|---|---|
| 1 | sí | 1 | ¿Quién dictó el curso “Etapas del Proceso Productivo de una Mina” y en qué fecha? | `01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p1` | 01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p1 (0.857)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p30 (0.857)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p2 (0.8238)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p11 (0.8238)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p28 (0.8231) |
| 2 | sí | 1 | En ese curso, ¿en qué rango de ley (%Cu) se sitúa el mineral de cobre en Chile? | `01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p5` | 01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p5 (0.8308)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p10 (0.8217)<br>7917586-cpem-2026.pdf p50 (0.8199)<br>2001-Proyectos_de_inversion_minera.pdf p61 (0.8185)<br>8277304-cpim-2026.pdf p16 (0.8181) |
| 3 | sí | 1 | ¿Con qué técnica se valoriza típicamente un proyecto minero según esa presentación? | `01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p8` | 01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p8 (0.8813)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p3 (0.8538)<br>8277304-cpim-2026.pdf p6 (0.8325)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p29 (0.8314)<br>2001-Proyectos_de_inversion_minera.pdf p4 (0.831) |
| 4 | sí | 1 | ¿Qué ley chilena formalizó el marco de certificación de recursos y reservas, y en qué año? | `01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p10` | 01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p10 (0.8648)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p6 (0.8105)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p7 (0.8065)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p28 (0.7895)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p11 (0.7894) |
| 5 | sí | 1 | ¿Cuál es el producto intermedio típico de la flotación en esa presentación? | `01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p20` | 01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p20 (0.8273)<br>pwc-mine-2025-v-espanol-cap-peruano.pdf p29 (0.7876)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p19 (0.7874)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p22 (0.7828)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p11 (0.7824) |
| 6 | sí | 1 | ¿Quién publicó el boletín “Proyectos de inversión minera y prospectos en estudio” y en qué fecha? | `2001-Proyectos_de_inversion_minera.pdf p2` | 2001-Proyectos_de_inversion_minera.pdf p2 (0.8517)<br>8277304-cpim-2026.pdf p8 (0.8421)<br>2001-Proyectos_de_inversion_minera.pdf p4 (0.8416)<br>8277304-cpim-2026.pdf p1 (0.8345)<br>7917586-cpem-2026.pdf p7 (0.8309) |
| 7 | sí | 5 | Según ese boletín, ¿en qué metales era el Perú el mayor productor y en cuáles el segundo? | `2001-Proyectos_de_inversion_minera.pdf p5` | 2001-Proyectos_de_inversion_minera.pdf p2 (0.8367)<br>pwc-mine-2025-v-espanol-cap-peruano.pdf p37 (0.8329)<br>pwc-mine-2025-v-espanol-cap-peruano.pdf p32 (0.8311)<br>pwc-mine-2025-v-espanol-cap-peruano.pdf p36 (0.8295)<br>2001-Proyectos_de_inversion_minera.pdf p5 (0.8292) |
| 8 | sí | 1 | ¿Qué porcentaje de las áreas de concesiones mineras estaba en explotación según INGEMMET 2001? | `2001-Proyectos_de_inversion_minera.pdf p5` | 2001-Proyectos_de_inversion_minera.pdf p5 (0.8273)<br>2001-Proyectos_de_inversion_minera.pdf p147 (0.814)<br>2001-Proyectos_de_inversion_minera.pdf p4 (0.8063)<br>2001-Proyectos_de_inversion_minera.pdf p3 (0.806)<br>2001-Proyectos_de_inversion_minera.pdf p23 (0.8047) |
| 9 | sí | 2 | Proyecto Accha (Titiminas): ¿empresa, departamento y metales? | `2001-Proyectos_de_inversion_minera.pdf p10` | 2001-Proyectos_de_inversion_minera.pdf p6 (0.8564)<br>2001-Proyectos_de_inversion_minera.pdf p10 (0.8374)<br>7917586-cpem-2026.pdf p37 (0.8301)<br>7917586-cpem-2026.pdf p90 (0.8285)<br>01.-Etapas-del-Proceso-Productivo-de-una-Mina.pdf p13 (0.8284) |
| 10 | no | — | ¿Cuántos proyectos y qué inversión tiene la Cartera de Exploración Minera 2026? | `7917586-cpem-2026.pdf p5` | 8277304-cpim-2026.pdf p1 (0.9211)<br>7917586-cpem-2026.pdf p1 (0.9145)<br>8277304-cpim-2026.pdf p29 (0.8883)<br>8277304-cpim-2026.pdf p10 (0.8871)<br>7917586-cpem-2026.pdf p15 (0.8866) |

## Criterio S3

- El chunk correcto debe estar en top-5 en **la mayoría** (≥6/10).
- Resultado: **PASA**.

## Q10 (miss)

La pregunta de la CPEM 2026 (“69 proyectos / US$ 757 millones”) trae portadas y resúmenes de la **CPIM** (inversión), no la página 5 de exploración. El embedding no distingue bien “cartera exploración” vs “cartera inversión”. S4 (BM25 / “757”, “69”) debería corregirlo.

## Cómo repetir

```bash
docker compose up -d
python3 src/retrieve.py search "¿Cuántos proyectos tiene la CPEM 2026?"
python3 src/retrieve.py eval
```
