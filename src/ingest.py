#!/usr/bin/env python3
"""Ingesta S2: PDF/DOCX → texto por página → chunks con metadatos."""

from __future__ import annotations

import json
import re
import sys
import zipfile
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT / ".vendor"
if VENDOR.is_dir():
    sys.path.insert(0, str(VENDOR))

from pypdf import PdfReader  # noqa: E402

RAW_DIR = ROOT / "data" / "raw"
CHUNKS_DIR = ROOT / "data" / "chunks"
REPORT_PATH = ROOT / "data" / "ingest-report.md"

MIN_PAGE_CHARS = 40
TARGET_CHARS = 2200  # ~550 tokens
MAX_CHARS = 3200  # ~800 tokens
OVERLAP_CHARS = 280
WS = re.compile(r"\s+")


@dataclass
class PageText:
    page: int
    text: str


@dataclass
class Chunk:
    chunk_id: str
    doc_id: str
    filename: str
    title: str
    date: str | None
    page: int
    text: str
    char_count: int
    token_est: int


GENERIC_TITLE = re.compile(r"^(diapositiva|slide|untitled)\s*\d*$", re.I)


def slugify(name: str) -> str:
    stem = Path(name).stem
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", stem).strip("-").lower()
    return slug or "doc"


def display_title(meta_title: str, path: Path) -> str:
    title = (meta_title or "").strip()
    if not title or GENERIC_TITLE.match(title):
        return path.stem.replace("_", " ")
    return title


def clean(text: str) -> str:
    return WS.sub(" ", text).strip()


def est_tokens(text: str) -> int:
    return max(1, len(text) // 4) if text else 0


def parse_pdf(path: Path) -> tuple[str, str | None, list[PageText]]:
    reader = PdfReader(str(path))
    meta = reader.metadata or {}
    title = display_title(getattr(meta, "title", None) or "", path)
    raw_date = getattr(meta, "creation_date", None)
    created = None
    if raw_date is not None:
        created = getattr(raw_date, "date", lambda: None)()
        created = created.isoformat() if created else None

    pages: list[PageText] = []
    for i, page in enumerate(reader.pages, start=1):
        text = clean(page.extract_text() or "")
        pages.append(PageText(page=i, text=text))
    return title, created, pages


def parse_docx(path: Path) -> tuple[str, str | None, list[PageText]]:
    """Texto de document.xml. DOCX no trae páginas reales: todo va a página 1."""
    with zipfile.ZipFile(path) as zf:
        xml = zf.read("word/document.xml")
    root = ET.fromstring(xml)
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    parts = [n.text for n in root.findall(".//w:t", ns) if n.text]
    text = clean(" ".join(parts))
    pages = [PageText(page=1, text=text)] if text else []
    return path.stem, None, pages


def parse_file(path: Path) -> tuple[str, str | None, list[PageText]]:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return parse_pdf(path)
    if suffix == ".docx":
        return parse_docx(path)
    raise ValueError(f"formato no soportado: {suffix}")


def split_long_page(text: str) -> list[str]:
    if len(text) <= MAX_CHARS:
        return [text]

    parts = re.split(r"(?<=[\.!?])\s+", text)
    chunks: list[str] = []
    buf = ""
    for part in parts:
        candidate = f"{buf} {part}".strip() if buf else part
        if len(candidate) <= MAX_CHARS:
            buf = candidate
            continue
        if buf:
            chunks.append(buf)
            overlap = buf[-OVERLAP_CHARS:] if len(buf) > OVERLAP_CHARS else buf
            buf = clean(f"{overlap} {part}")
        else:
            for i in range(0, len(part), TARGET_CHARS):
                piece = part[i : i + MAX_CHARS]
                if piece:
                    chunks.append(piece)
            buf = ""
    if buf:
        chunks.append(buf)
    return chunks or [text[:MAX_CHARS]]


def chunk_pages(doc_id: str, filename: str, title: str, date: str | None, pages: list[PageText]) -> tuple[list[Chunk], int]:
    chunks: list[Chunk] = []
    discarded = 0
    n = 0
    for page in pages:
        if len(page.text) < MIN_PAGE_CHARS:
            discarded += 1
            continue
        for piece in split_long_page(page.text):
            n += 1
            chunks.append(
                Chunk(
                    chunk_id=f"{doc_id}-p{page.page}-{n:04d}",
                    doc_id=doc_id,
                    filename=filename,
                    title=title,
                    date=date,
                    page=page.page,
                    text=piece,
                    char_count=len(piece),
                    token_est=est_tokens(piece),
                )
            )
    return chunks, discarded


def iter_inputs(raw_dir: Path) -> list[Path]:
    files = [p for p in raw_dir.iterdir() if p.is_file() and p.suffix.lower() in {".pdf", ".docx"}]
    return sorted(files)


def write_report(rows: list[dict], chunks: list[Chunk], failures: list[str]) -> None:
    docs = len(rows)
    pages = sum(r["pages"] for r in rows)
    indexable = sum(r["pages_indexable"] for r in rows)
    discarded = sum(r["pages_discarded"] for r in rows)
    usable = (indexable / pages * 100) if pages else 0

    lines = [
        "# Informe de ingesta (S2)",
        "",
        f"Fecha: {date.today().isoformat()}",
        f"Entrada: `{RAW_DIR.relative_to(ROOT)}`",
        f"Chunks: `{CHUNKS_DIR.relative_to(ROOT)}/all.jsonl`",
        "",
        f"- Documentos procesados: **{docs}**",
        f"- Páginas totales: **{pages}**",
        f"- Páginas indexables: **{indexable}** ({usable:.1f}%)",
        f"- Páginas descartadas (< {MIN_PAGE_CHARS} chars): **{discarded}**",
        f"- Chunks generados: **{len(chunks)}**",
        f"- Corpus usable sin OCR: **{usable:.1f}%** de las páginas",
        "",
        "## Por archivo",
        "",
        "| Archivo | Páginas | Indexables | Descartadas | Chunks | Título |",
        "|---|---:|---:|---:|---:|---|",
    ]
    for r in rows:
        lines.append(
            f"| `{r['filename']}` | {r['pages']} | {r['pages_indexable']} | "
            f"{r['pages_discarded']} | {r['chunks']} | {r['title']} |"
        )
    lines += ["", "## Fallos", ""]
    if failures:
        lines += [f"- {f}" for f in failures]
    else:
        lines.append("- Ninguno.")
    lines += [
        "",
        "## Notas",
        "",
        "- Chunk ≈400–800 tokens (estimado chars/4), overlap en páginas largas, un chunk no cruza de página.",
        "- Cada chunk: `{doc_id, filename, title, date, page, text}`.",
        "- DOCX (si aparece) no tiene página real: se guarda como página 1.",
        "",
    ]
    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

    inputs = iter_inputs(RAW_DIR)
    if not inputs:
        print(f"No hay PDF/DOCX en {RAW_DIR}", file=sys.stderr)
        return 1

    all_chunks: list[Chunk] = []
    rows: list[dict] = []
    failures: list[str] = []

    for path in inputs:
        try:
            title, created, pages = parse_file(path)
            doc_id = slugify(path.name)
            chunks, discarded = chunk_pages(doc_id, path.name, title, created, pages)
            all_chunks.extend(chunks)
            rows.append(
                {
                    "doc_id": doc_id,
                    "filename": path.name,
                    "title": title,
                    "date": created,
                    "pages": len(pages),
                    "pages_indexable": len(pages) - discarded,
                    "pages_discarded": discarded,
                    "chunks": len(chunks),
                }
            )
            print(f"OK  {path.name}: {len(pages)} pág, {len(chunks)} chunks, {discarded} vacías")
        except Exception as exc:  # noqa: BLE001 — log and continue per file
            msg = f"{path.name}: {type(exc).__name__}: {exc}"
            failures.append(msg)
            print(f"ERR {msg}", file=sys.stderr)

    out = CHUNKS_DIR / "all.jsonl"
    with out.open("w", encoding="utf-8") as fh:
        for chunk in all_chunks:
            fh.write(json.dumps(asdict(chunk), ensure_ascii=False) + "\n")

    summary = {
        "documents": rows,
        "failures": failures,
        "chunk_count": len(all_chunks),
    }
    (CHUNKS_DIR / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    write_report(rows, all_chunks, failures)
    print(f"\nChunks: {out}")
    print(f"Informe: {REPORT_PATH}")
    return 1 if failures and not all_chunks else 0


if __name__ == "__main__":
    raise SystemExit(main())
