#!/usr/bin/env bash
# Corre UNA vez en la EC2 (Ubuntu Deep Learning AMI o Ubuntu + drivers NVIDIA).
set -euo pipefail

echo "== GPU =="
nvidia-smi

if ! command -v docker >/dev/null; then
  echo "Instala Docker en esta AMI y vuelve a correr el script." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  sudo usermod -aG docker "$USER" || true
  echo "Cierra sesión SSH y entra de nuevo para usar Docker sin sudo." >&2
fi

cd "$(dirname "$0")/../.."
mkdir -p data/qdrant data/ollama data/models data/chunks data/raw

echo "== Qdrant + Ollama =="
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d

echo "== Modelo liviano (smoke) =="
docker compose -f docker-compose.yml -f docker-compose.gpu.yml exec -T ollama ollama pull qwen3:8b
docker compose -f docker-compose.yml -f docker-compose.gpu.yml exec -T ollama ollama run qwen3:8b "Di solo: ok"

echo "== Listo. Siguiente: pull qwen3:14b y python3 src/ingest.py && python3 src/retrieve.py index =="
echo "Apaga la instancia desde tu laptop:  aws ec2 stop-instances --instance-ids <ID>"
