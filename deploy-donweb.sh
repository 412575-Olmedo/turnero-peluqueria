#!/bin/bash

# Script para desplegar en DonWeb - Linux/Mac
# ============================================

echo "🚀 Iniciando despliegue en DonWeb..."

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "📝 Copia .env.example a .env y configura tus variables de producción"
    exit 1
fi

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    exit 1
fi

# Verificar que Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado"
    exit 1
fi

echo "✅ Verificaciones completadas"

# Detener servicios existentes
echo "🛑 Deteniendo servicios existentes..."
docker-compose -f docker-compose.prod.yml down

# Construir imágenes
echo "🔨 Construyendo imágenes Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
echo ""
echo "📊 Estado de los servicios:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Despliegue completado!"
echo ""
echo "📝 Para ver los logs en tiempo real:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🌐 Accede a tu aplicación en:"
echo "   Frontend: http://tu-dominio"
echo "   Backend API: http://tu-dominio:8080/api"
echo ""
