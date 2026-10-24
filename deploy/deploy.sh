#!/usr/bin/env bash
# Actualiza el sitio en el VPS con lo último de main.
#   cd /var/www/arthub-front && ./deploy/deploy.sh
#
# La URL de la API se toma de .env.production.local (no está en el repo), al compilar.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env.production.local ]; then
  echo "Falta .env.production.local con NEXT_PUBLIC_API_URL (ver DESPLIEGUE.md, paso 6)." >&2
  exit 1
fi

echo "→ Bajando cambios de main"
git pull --ff-only origin main

echo "→ Dependencias y compilación"
npm ci
npm run build

echo "→ Reiniciando el sitio"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "✓ Sitio actualizado ($(git rev-parse --short HEAD))"
