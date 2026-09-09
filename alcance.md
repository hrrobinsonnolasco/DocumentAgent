# Alcance del PoC — DocumentAgent

**Estado:** listo para revisar  
**Tope de costo AWS (PoC S1–S6):** USD 80  
**Decisión go/no-go:** fin de S6

## Qué se construye

Chat (CLI o una pantalla) que responde preguntas sobre reportes geotécnicos **solo con el texto indexado**, citando **archivo + página**. Todo el modelo corre **local** (Ollama). La prueba vive en EC2 con GPU y se apaga al final del día.

## Entra en el PoC (S1–S6)

- 50–100 PDF nativos y/o DOCX
- 20 preguntas del set dorado (incluidas 2–3 “el dato no está”)
- Ingesta → chunks → Qdrant + bge-m3 → Qwen3 14B (fallback 8B)
- Respuesta con citas obligatorias
- Informe de calidad, latencia y costo

## No entra (hasta un GO en S6)

- Bedrock, OpenAI, H100/A100
- RBAC por documento, SSO, SharePoint
- PPTX, mapas, fotos de bancos, OCR masivo
- Excel de instrumentación (S9, si hay go)

## Criterios go (hay que cumplir los tres)

1. ≥ 70% de las 20 preguntas: correcta **y** con cita a la página adecuada
2. Latencia típica ≤ 15 s (un usuario)
3. Un ingeniero entiende de dónde salió cada respuesta en 5 preguntas

## Stack fijo

Ollama + Qwen3 14B Q4 · bge-m3 · Qdrant · EC2 g5/g6.xlarge · Docker
