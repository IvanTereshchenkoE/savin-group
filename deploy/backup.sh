#!/usr/bin/env bash
set -euo pipefail

# SAVIN GROUP - Automated PostgreSQL Backup Script
BACKUP_DIR="${BACKUP_DIR:-/srv/backups/postgres}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="${POSTGRES_CONTAINER:-deploy-postgres-1}"
DB_NAME="${POSTGRES_DB:-savin_group}"
DB_USER="${POSTGRES_USER:-postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "${BACKUP_DIR}"

BACKUP_FILE="${BACKUP_DIR}/savin_db_${TIMESTAMP}.sql.gz"

echo "📦 [$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting database backup for '${DB_NAME}'..."

docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "✅ Backup created successfully: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Retention policy: remove backups older than RETENTION_DAYS
echo "🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "savin_db_*.sql.gz" -mtime +"${RETENTION_DAYS}" -delete

echo "✨ Backup job completed."
