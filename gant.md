# DocumentAgent — Checklist y Gantt (local-first)

Marca `[x]` cuando termines. En Cursor: clic en la casilla del preview, o cambia `- [ ]` por `- [x]`.

**PoC:** S1–S6 (obligatorio) · **Post-PoC:** S7–S12 (solo si hay go en S6)

---

## Progreso rápido

- [ ] **S1** Alcance, corpus, GPU
- [x] **S2** Ingesta PDF/DOCX y chunking
- [x] **S3** Embeddings y retrieval
- [ ] **S4** Búsqueda híbrida
- [ ] **S5** RAG local + citas
- [ ] **S6** Evaluación y go / no-go
- [ ] **S7–S8** UI y login *(bloquear hasta go)*
- [ ] **S9–S10** Excel / OCR piloto *(bloquear hasta go)*
- [ ] **S11–S12** Empaque onsite y entrega *(bloquear hasta go)*

---

## Criterios de éxito (S6) — el PoC aprueba si

- [ ] ≥ 70% de las 20 preguntas: respuesta correcta **y** cita a la página adecuada
- [ ] Latencia típica ≤ 15 s (un usuario, GPU encendida)
- [ ] Un ingeniero no técnico hace 5 preguntas y entiende de dónde salió cada respuesta

Si falla el 70%: no abrir S7. Iterar chunk/prompt/k, no subir a 70B.

---

## S1 — Alcance, corpus y GPU

Archivos de esta semana: `alcance.md` · `data/inventario.md` · `data/set-dorado.md` · documentos en `data/raw/`

- [x] Alcance escrito (qué entra / qué no) y tope de costo AWS → `alcance.md`
- [x] Criterios go/no-go acordados (los de arriba)
- [x] Inventario de docs: 6 PDF nativos + 2 imágenes rejected → `data/inventario.md`
- [x] % del corpus PDF usable sin OCR: 100% (6/6)
- [x] Set dorado: 20 preguntas → `data/set-dorado.md`
- [x] Cada pregunta “está” tiene respuesta esperada + archivo + página
- [x] 3 preguntas del set son “el dato no está” (Q18–Q20)
- [ ] Cuenta AWS + VPC mínima + security group (solo tu IP)
- [ ] EC2 `g5.xlarge` o `g6.xlarge` levantada
- [ ] Docker + NVIDIA Container Toolkit + GPU visible (`nvidia-smi`)
- [ ] Ollama instalado y smoke con `qwen3:8b`
- [ ] Un PDF nativo parseado a texto (prueba de parser)
- [ ] Alarma de billing si el gasto > USD 20/día
- [ ] Regla: **Stop instance** al terminar el día (EBS se queda)

**Entregable S1**

- [ ] `alcance.md`
- [ ] Hoja de inventario
- [ ] Tabla del set dorado
- [ ] Instancia que responde `ollama run`

---

## S2 — Ingesta PDF/DOCX y chunking

Correr: `python3 src/ingest.py` · salida: `data/chunks/` · informe: `data/ingest-report.md`

- [x] Carpeta de entrada `data/raw/` (sin SharePoint)
- [x] Parser PDF nativo (`pypdf`)
- [x] Parser DOCX (stdlib; no hay .docx en el corpus aún)
- [x] Log de archivos que fallan o salen vacíos
- [x] Metadatos por doc: ruta, título, fecha, nº de páginas
- [x] Texto extraído con número de página
- [x] Escaneos / PDFs imagen apartados (no se indexan en el PoC)
- [x] Chunking ≈400–800 tokens, overlap, corte por página
- [x] Cada chunk guarda `{doc_id, filename, page, text}`
- [x] Conteo: páginas indexables vs descartadas (493/500 = 98.6%)

**Entregable S2**

- [x] Carpeta / tabla de chunks → `data/chunks/all.jsonl` (535 chunks)
- [x] Informe: **98.6%** del corpus usable sin OCR → `data/ingest-report.md`

---

## S3 — Embeddings y búsqueda vectorial

Qdrant: `docker compose up -d` · indexar: `python3 src/retrieve.py index` · buscar: `python3 src/retrieve.py search "pregunta"` · eval: `python3 src/retrieve.py eval`

- [x] Qdrant arriba (Docker) y persistente (`data/qdrant/`)
- [x] Embeddings locales: **multilingual-e5-large** (FastEmbed 0.8 no trae bge-m3; E5 está en el alcance)
- [x] Índice cargado en batch (CPU; no hay GPU en esta máquina)
- [x] Query: pregunta → top-5 chunks + score
- [x] Filtro opcional por archivo (`--filename`)
- [x] 10 preguntas del set dorado revisadas
- [x] Chunk correcto en top-5: **9/10 (90%)** — PASA (≥6)
- [x] Q10 falla (confunde CPEM con CPIM). No se integra LLM hasta S4/híbrido o se acepta el 90%.

**Entregable S3**

- [x] Índice persistente (535 vectores, colección `documents`)
- [x] 10 queries anotadas → `data/retrieval-eval.md`

---

## S4 — Híbrido liviano

- [ ] Búsqueda keyword / BM25 (nº sondeo, banco, fecha)
- [ ] Fusión de scores (RRF o suma simple)
- [ ] k final = 6–8 chunks
- [ ] Ajuste de tamaño de chunk si corta tablas o títulos
- [ ] Recall@8 medido contra el set dorado

**Entregable S4**

- [ ] Retrieve híbrido + número de recall@8

---

## S5 — LLM local y RAG

- [ ] `qwen3:14b` Q4 cargado en Ollama
- [ ] `num_ctx` = 16384 (si no cabe: anotar bajada a 8B o ctx 8K)
- [ ] VRAM medida (`ollama ps` / `nvidia-smi`)
- [ ] Prompt: solo contexto recuperado; no inventar cifras (FS, cohesión, etc.)
- [ ] Prompt: si no hay evidencia, decir que no está
- [ ] Inyección de 4–8 chunks
- [ ] Respuesta con citas obligatorias `{archivo, página, extracto}`
- [ ] Sin cita → no se muestra como respuesta válida
- [ ] Chat CLI (o UI de una pantalla)
- [ ] Latencia y tokens anotados en 5 preguntas de prueba

**Entregable S5**

- [ ] Pipeline pregunta → respuesta + citas funcionando

---

## S6 — Evaluación y decisión

- [ ] Las 20 preguntas, pasada 1 (tabla: ok respuesta / ok cita / latencia / error)
- [ ] Un ajuste de chunk, k o prompt (no cambiar de familia de modelo)
- [ ] Las 20 preguntas, pasada 2
- [ ] % de acierto con cita correcta
- [ ] Latencia típica anotada
- [ ] Prueba con un ingeniero: 5 preguntas
- [ ] Costos AWS reales de S1–S6
- [ ] `informe-poc.md` escrito
- [ ] **Go** o **no-go** marcado abajo

**Decisión S6** (marca solo una)

- [ ] GO — se abre S7
- [ ] NO-GO — se itera S2–S5; S7+ sigue cerrado

**Entregable S6**

- [ ] `informe-poc.md`

---

## S7–S8 — UI y acceso *(solo si hay GO)*

- [ ] Confirmado: hay GO en S6
- [ ] Chat web: caja de pregunta + respuesta
- [ ] Citas visibles y clicables (archivo + página)
- [ ] Streaming de tokens (si sale fácil; si no, respuesta completa)
- [ ] Login simple (usuario/clave o JWT interno)
- [ ] Historial de conversación por usuario
- [ ] Un ingeniero beta: 1 sesión de prueba

**Entregable S8**

- [ ] Chat usable en el navegador

---

## S9–S10 — Más datos y formatos *(solo si hay GO)*

- [ ] Confirmado: hay GO en S6
- [ ] Más PDFs del mismo tipo que ya funcionó
- [ ] Excel/CSV: cada fila = un record (columnas en el texto), no chunk ciego
- [ ] OCR piloto en 10–20 escaneos
- [ ] Medido % de texto OCR útil
- [ ] Si OCR &lt; 50% útil: OCR queda fuera del cierre
- [ ] Reranker liviano **solo** si el 70% del set dorado no se alcanza

**Entregable S10**

- [ ] Corpus ampliado + nota Excel/OCR (entra o no)

---

## S11–S12 — Empaque onsite y cierre *(solo si hay GO)*

- [ ] Confirmado: hay GO en S6
- [ ] `docker-compose.yml` único: app + Qdrant + Ollama
- [ ] Levanta en frío (reboot → up → una pregunta funciona)
- [ ] Runbook: cómo dar de alta docs
- [ ] Runbook: backup del índice
- [ ] Runbook: apagar GPU / instancia
- [ ] Spec hardware onsite: 16–24 GB VRAM, 32 GB RAM, ~15 GB para modelos (no H100)
- [ ] Capacitación 1 h
- [ ] 10 preguntas de aceptación pasadas con el usuario
- [ ] Entrega: repo + compose + set dorado + costos

**Entregable S12**

- [ ] Paquete onsite entregado

---

## Hábitos de costo (todas las semanas con GPU)

- [ ] Instancia apagada al final de cada jornada
- [ ] Revisar billing AWS al menos 2 veces por semana

---

## Gantt (referencia de timing)

```
==============================================================================================================
FASE / ACTIVIDAD                                        | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 |S10 |S11 |S12 |
==============================================================================================================
[S1] Alcance, corpus y GPU                              |████|    |    |    |    |    |    |    |    |    |    |    |
[S2] Ingesta PDF/DOCX y chunking                        |    |████|░░░░|    |    |    |    |    |    |    |    |    |
[S3] Embeddings y retrieval                             |    |    |████|░░░░|    |    |    |    |    |    |    |    |
[S4] Híbrido liviano                                    |    |    |    |████|    |    |    |    |    |    |    |    |
[S5] RAG local + citas                                  |    |    |    |░░░░|████|    |    |    |    |    |    |    |
[S6] Evaluación go/no-go                                |    |    |    |    |    |████|    |    |    |    |    |    |
----- STOP: sin go no se abre S7 --------------------------------------------------------------------------------
[S7–S8] UI + login                             (go)     |    |    |    |    |    |    |████|████|    |    |    |    |
[S9–S10] Excel / OCR piloto                    (go)     |    |    |    |    |    |    |    |░░░░|████|████|    |    |
[S11–S12] Compose onsite + entrega             (go)     |    |    |    |    |    |    |    |    |    |░░░░|████|████|
==============================================================================================================
```

---

## Decisiones (para no reabrir debate)

| Tema | Decisión |
|---|---|
| IA | Ollama + Qwen3 14B Q4 (fallback 8B) |
| Embeddings | bge-m3 |
| Vectores | Qdrant |
| PoC | EC2 g5/g6.xlarge, ~USD 1.00–1.30/h |
| Destino | Mismo Docker en oficina/mina (16–24 GB VRAM) |
| Bedrock / OpenAI | No van en el camino crítico |
| RBAC, H100, PPTX, OCR masivo, RAGAS lab | Fuera de este checklist |

---

## Fuera de alcance (no marcar como “pendiente”)

- RBAC por documento / SSO corporativo
- Modelos 70B / servidores H100–A100
- Planos, fotos de bancos y PPTX como fuente primaria
- Conectores SharePoint / correo / ERP
- Fine-tune del LLM
