# Script de despliegue en DonWeb - PowerShell
# ============================================

param(
    [switch]$NoBuild = $false,
    [switch]$ShowLogs = $false
)

Write-Host "🚀 Iniciando despliegue en DonWeb..." -ForegroundColor Green
Write-Host ""

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: No se encontró el archivo .env" -ForegroundColor Red
    Write-Host "📝 Copia .env.example a .env y configura tus variables de producción" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ejecuta: Copy-Item .env.example .env" -ForegroundColor Cyan
    exit 1
}

# Verificar que Docker está instalado
try {
    $null = docker --version
    Write-Host "✅ Docker instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar que Docker Compose está instalado
try {
    $null = docker-compose --version
    Write-Host "✅ Docker Compose instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker Compose no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Detener servicios existentes
Write-Host "🛑 Deteniendo servicios existentes..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

if (-not $NoBuild) {
    # Construir imágenes
    Write-Host "🔨 Construyendo imágenes Docker (esto puede tardar varios minutos)..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al construir las imágenes" -ForegroundColor Red
        exit 1
    }
}

# Iniciar servicios
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar los servicios" -ForegroundColor Red
    exit 1
}

# Esperar a que los servicios estén listos
Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "📊 Estado de los servicios:" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps

Write-Host ""
Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs:          docker-compose -f docker-compose.prod.yml logs -f"
Write-Host "   Detener:           docker-compose -f docker-compose.prod.yml down"
Write-Host "   Reiniciar backend: docker-compose -f docker-compose.prod.yml restart backend"
Write-Host "   Health check:      curl http://localhost:8080/actuator/health"
Write-Host ""
Write-Host "🌐 Accede a tu aplicación en:" -ForegroundColor Cyan
Write-Host "   Frontend:    http://localhost"
Write-Host "   Backend API: http://localhost:8080/api"
Write-Host "   Swagger:     http://localhost:8080/swagger-ui.html"
Write-Host ""

if ($ShowLogs) {
    Write-Host "📋 Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml logs -f
}
