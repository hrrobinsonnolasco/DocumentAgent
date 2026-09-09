# DocumentAgent

PoC de RAG **local-first** sobre documentos mineros: ingesta PDF → chunks → Qdrant + embeddings → (luego) chat con citas. La prueba en nube es una EC2 con GPU, no Bedrock.

## Estado

- S1–S3 hechos (corpus, ingesta, retrieval 9/10).
- S4 híbrido y S5 chat (Ollama) pendientes.
- Guía AWS y costos: [`deploy/aws.md`](deploy/aws.md).
- Checklist: [`gant.md`](gant.md).

Los PDF de `data/raw/`, el índice Qdrant y los modelos **no** van al repo (`.gitignore`).

## Local

```bash
docker compose up -d          # Qdrant
python3 src/ingest.py
python3 src/retrieve.py index
python3 src/retrieve.py search "tu pregunta"
python3 src/retrieve.py eval
```

Dependencias: `requirements.txt` (o `.vendor` ya generado en la máquina de trabajo).
