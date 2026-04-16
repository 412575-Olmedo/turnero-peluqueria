#!/bin/bash

# Script para crear backup de la base de datos
# ============================================

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

echo "🗄️  Creando backup de la base de datos..."

# Crear backup
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U $DB_USERNAME $POSTGRES_DB | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup creado exitosamente: $BACKUP_FILE"
    
    # Mostrar tamaño del archivo
    SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "📦 Tamaño del backup: $SIZE"
    
    # Eliminar backups antiguos (mantener últimos 7 días)
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
    echo "🧹 Backups antiguos eliminados (se mantienen los últimos 7 días)"
else
    echo "❌ Error al crear el backup"
    exit 1
fi
