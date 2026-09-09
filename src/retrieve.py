#!/usr/bin/env python3
"""S3: embeddings bge-m3 + Qdrant. index | search | eval."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT / ".vendor"
if VENDOR.is_dir():
    sys.path.insert(0, str(VENDOR))

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, FieldCondition, Filter, MatchValue, PointStruct, VectorParams

from fastembed import TextEmbedding

CHUNKS_PATH = ROOT / "data" / "chunks" / "all.jsonl"
GOLDEN_PATH = ROOT / "data" / "set-dorado.json"
EVAL_PATH = ROOT / "data" / "retrieval-eval.md"
MODEL_CACHE = ROOT / "data" / "models"
COLLECTION = "documents"
# FastEmbed 0.8 no incluye bge-m3. E5 multilingual es la familia del alcance (BGE/E5/Nomic).
MODEL_NAME = "intfloat/multilingual-e5-large"
VECTOR_SIZE = 1024
QDRANT_URL = "http://127.0.0.1:6333"
BATCH = 8
_MODEL: TextEmbedding | None = None


def client() -> QdrantClient:
    return QdrantClient(url=QDRANT_URL, timeout=60, check_compatibility=False)


def load_chunks() -> list[dict]:
    if not CHUNKS_PATH.exists():
        raise SystemExit(f"No hay chunks. Corre primero: python3 src/ingest.py")
    return [json.loads(line) for line in CHUNKS_PATH.read_text(encoding="utf-8").splitlines() if line.strip()]


def embedder() -> TextEmbedding:
    global _MODEL
    if _MODEL is None:
        MODEL_CACHE.mkdir(parents=True, exist_ok=True)
        _MODEL = TextEmbedding(model_name=MODEL_NAME, cache_dir=str(MODEL_CACHE))
    return _MODEL


def cmd_index() -> int:
    chunks = load_chunks()
    qdrant = client()
    if qdrant.collection_exists(COLLECTION):
        qdrant.delete_collection(COLLECTION)
    qdrant.create_collection(
        collection_name=COLLECTION,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )

    model = embedder()
    texts = [c["text"] for c in chunks]
    print(f"Indexando {len(chunks)} chunks con {MODEL_NAME} (CPU)…")
    vectors = list(model.passage_embed(texts, batch_size=BATCH))

    points = []
    for i, (chunk, vector) in enumerate(zip(chunks, vectors, strict=True)):
        points.append(
            PointStruct(
                id=i,
                vector=vector.tolist(),
                payload={
                    "chunk_id": chunk["chunk_id"],
                    "doc_id": chunk["doc_id"],
                    "filename": chunk["filename"],
                    "title": chunk.get("title") or "",
                    "page": chunk["page"],
                    "text": chunk["text"],
                },
            )
        )
    qdrant.upsert(collection_name=COLLECTION, points=points)
    info = qdrant.get_collection(COLLECTION)
    print(f"Listo: {info.points_count} vectores en '{COLLECTION}'")
    return 0


def search(query: str, top_k: int = 5, filename: str | None = None) -> list[dict]:
    qdrant = client()
    model = embedder()
    vector = next(model.query_embed(query))
    query_filter = None
    if filename:
        query_filter = Filter(must=[FieldCondition(key="filename", match=MatchValue(value=filename))])
    hits = qdrant.query_points(
        collection_name=COLLECTION,
        query=vector.tolist(),
        limit=top_k,
        query_filter=query_filter,
        with_payload=True,
    ).points
    rows = []
    for rank, hit in enumerate(hits, start=1):
        payload = hit.payload or {}
        rows.append(
            {
                "rank": rank,
                "score": round(float(hit.score), 4),
                "filename": payload.get("filename"),
                "page": payload.get("page"),
                "chunk_id": payload.get("chunk_id"),
                "text": payload.get("text", ""),
            }
        )
    return rows


def cmd_search(query: str, top_k: int, filename: str | None) -> int:
    rows = search(query, top_k=top_k, filename=filename)
    if not rows:
        print("Sin resultados. ¿Corriste `python3 src/retrieve.py index`?")
        return 1
    for row in rows:
        preview = " ".join(row["text"].split())[:220]
        print(f"#{row['rank']}  {row['score']:.4f}  {row['filename']}  p{row['page']}")
        print(f"    {preview}")
        print()
    return 0


def is_hit(row: dict, expected_file: str, expected_page: int) -> bool:
    return row.get("filename") == expected_file and int(row.get("page") or 0) == int(expected_page)


def cmd_eval(top_k: int) -> int:
    questions = json.loads(GOLDEN_PATH.read_text(encoding="utf-8"))
    subset = [q for q in questions if q["tipo"] == "está"][:10]
    print(f"Evaluando {len(subset)} preguntas (top-{top_k})…")
    # carga el modelo una sola vez
    _ = embedder()
    results = []
    hits = 0
    for q in subset:
        rows = search(q["pregunta"], top_k=top_k)
        hit_rank = next((r["rank"] for r in rows if is_hit(r, q["archivo"], q["pagina"])), None)
        ok = hit_rank is not None
        hits += int(ok)
        results.append(
            {
                "id": q["id"],
                "pregunta": q["pregunta"],
                "esperado": f"{q['archivo']} p{q['pagina']}",
                "hit": ok,
                "rank": hit_rank,
                "top": [f"{r['filename']} p{r['page']} ({r['score']})" for r in rows],
            }
        )
        mark = "HIT" if ok else "MISS"
        print(f"Q{q['id']:02d} {mark} rank={hit_rank}  {q['pregunta'][:70]}")

    recall = hits / len(subset) if subset else 0
    lines = [
        "# Evaluación retrieval (S3)",
        "",
        f"Modelo: `{MODEL_NAME}` · colección `{COLLECTION}` · top-{top_k}",
        f"Recall@{top_k}: **{hits}/{len(subset)} = {recall:.0%}**",
        "",
        "Hit = mismo archivo **y** misma página que el set dorado.",
        "",
        "| # | Hit | Rank | Pregunta | Esperado | Top resultados |",
        "|---|---|---:|---|---|---|",
    ]
    for r in results:
        mark = "sí" if r["hit"] else "no"
        rank = r["rank"] if r["rank"] is not None else "—"
        top = "<br>".join(r["top"])
        lines.append(f"| {r['id']} | {mark} | {rank} | {r['pregunta']} | `{r['esperado']}` | {top} |")
    lines += [
        "",
        "## Criterio S3",
        "",
        "- El chunk correcto debe estar en top-5 en **la mayoría** (≥6/10).",
        f"- Resultado: **{'PASA' if hits >= 6 else 'NO PASA'}**.",
        "",
    ]
    EVAL_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"\nRecall@{top_k}: {hits}/{len(subset)} ({recall:.0%}) → {EVAL_PATH}")
    return 0 if hits >= 6 else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="S3 retrieval: index / search / eval")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("index", help="crear colección e indexar chunks")
    p_search = sub.add_parser("search", help="pregunta → top-k")
    p_search.add_argument("query")
    p_search.add_argument("-k", "--top-k", type=int, default=5)
    p_search.add_argument("-f", "--filename", default=None)
    p_eval = sub.add_parser("eval", help="medir Q1–Q10 del set dorado")
    p_eval.add_argument("-k", "--top-k", type=int, default=5)
    args = parser.parse_args()
    if args.cmd == "index":
        return cmd_index()
    if args.cmd == "search":
        return cmd_search(args.query, args.top_k, args.filename)
    return cmd_eval(args.top_k)


if __name__ == "__main__":
    raise SystemExit(main())
