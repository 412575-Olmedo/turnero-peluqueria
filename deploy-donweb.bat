@echo off
REM Script para desplegar en DonWeb - Windows
REM ==========================================

echo 🚀 Iniciando despliegue en DonWeb...

REM Verificar que existe el archivo .env
if not exist .env (
    echo ❌ Error: No se encontró el archivo .env
    echo 📝 Copia .env.example a .env y configura tus variables de producción
    exit /b 1
)

REM Verificar que Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker no está instalado
    exit /b 1
)

REM Verificar que Docker Compose está instalado
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker Compose no está instalado
    exit /b 1
)

echo ✅ Verificaciones completadas

REM Detener servicios existentes
echo 🛑 Deteniendo servicios existentes...
docker-compose -f docker-compose.prod.yml down

REM Construir imágenes
echo 🔨 Construyendo imágenes Docker...
docker-compose -f docker-compose.prod.yml build --no-cache

REM Iniciar servicios
echo 🚀 Iniciando servicios...
docker-compose -f docker-compose.prod.yml up -d

REM Esperar a que los servicios estén listos
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 10 /nobreak >nul

REM Verificar estado de los servicios
echo.
echo 📊 Estado de los servicios:
docker-compose -f docker-compose.prod.yml ps

echo.
echo ✅ Despliegue completado!
echo.
echo 📝 Para ver los logs en tiempo real:
echo    docker-compose -f docker-compose.prod.yml logs -f
echo.
echo 🌐 Accede a tu aplicación en:
echo    Frontend: http://tu-dominio
echo    Backend API: http://tu-dominio:8080/api
echo.

pause
