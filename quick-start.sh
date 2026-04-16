#!/bin/bash

# Script de inicio rápido para el sistema de turnos
# Ejecutar: ./quick-start.sh

set -e

echo "🎨 Sistema de Turnos - Peluquería"
echo "=================================="
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "Por favor, instalar Docker desde https://www.docker.com/"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado"
    echo "Por favor, instalar Docker Compose"
    exit 1
fi

echo "✅ Docker encontrado"
echo "✅ Docker Compose encontrado"
echo ""

# Detener contenedores previos si existen
echo "🧹 Limpiando contenedores previos..."
docker-compose down 2>/dev/null || true

echo ""
echo "🏗️  Construyendo imágenes..."
docker-compose build

echo ""
echo "🚀 Iniciando servicios..."
docker-compose up -d

echo ""
echo "⏳ Esperando que los servicios estén listos..."
echo "   (Esto puede tomar 1-2 minutos en el primer inicio)"

# Esperar a que el backend esté listo
echo -n "   Esperando PostgreSQL..."
until docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo " ✅"

echo -n "   Esperando Backend..."
until curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; do
    echo -n "."
    sleep 3
done
echo " ✅"

echo -n "   Esperando Frontend..."
until curl -s http://localhost > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo " ✅"

echo ""
echo "✅ ¡Sistema iniciado exitosamente!"
echo ""
echo "📍 URLs de acceso:"
echo "   Frontend:  http://localhost"
echo "   Backend:   http://localhost:8080"
echo "   Swagger:   http://localhost:8080/swagger-ui.html"
echo ""
echo "👤 Credenciales de prueba:"
echo "   Usuario Admin:   admin / password"
echo "   Usuario Cliente: cliente1 / password"
echo ""
echo "📊 Ver logs en tiempo real:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Detener el sistema:"
echo "   docker-compose down"
echo ""
echo "🎉 ¡Listo para usar!"
