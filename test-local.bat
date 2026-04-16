@echo off
REM Script para probar el sistema completo localmente antes de desplegar a DonWeb
REM ================================================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   🧪 PRUEBA LOCAL - Turnero Peluquería                    ║
echo ║   Esto iniciará el sistema completo en tu computadora     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar que existe el archivo .env
if not exist .env (
    echo ❌ Error: No se encontró el archivo .env
    echo.
    echo 📝 Creando .env desde .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones
    echo    Luego ejecuta este script nuevamente
    pause
    exit /b 1
)

REM Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker no está instalado
    echo.
    echo 📥 Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker Compose no está instalado
    pause
    exit /b 1
)

echo ✅ Verificaciones completadas
echo.

REM Detener servicios existentes (si los hay)
echo 🛑 Deteniendo servicios existentes (si los hay)...
docker-compose down >nul 2>&1

echo.
echo 🔨 Construyendo imágenes Docker...
echo    (Esto puede tomar varios minutos la primera vez)
echo.
docker-compose build

if errorlevel 1 (
    echo.
    echo ❌ Error al construir las imágenes
    echo    Revisa los mensajes de error arriba
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando servicios...
echo.
docker-compose up -d

echo.
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 15 /nobreak >nul

echo.
echo ═══════════════════════════════════════════════════════════
echo 📊 ESTADO DE LOS SERVICIOS:
echo ═══════════════════════════════════════════════════════════
docker-compose ps
echo.

echo ═══════════════════════════════════════════════════════════
echo ✅ ¡SISTEMA INICIADO!
echo ═══════════════════════════════════════════════════════════
echo.
echo 🌐 Accede a tu aplicación en:
echo.
echo    📱 Frontend (Página principal):
echo       http://localhost
echo       http://localhost:80
echo.
echo    🔧 Backend API:
echo       http://localhost:8080/api
echo.
echo    📚 Documentación API (Swagger):
echo       http://localhost:8080/swagger-ui.html
echo.
echo    🩺 Health Check:
echo       http://localhost:8080/actuator/health
echo.
echo    🗄️  Base de datos PostgreSQL:
echo       Host: localhost
echo       Puerto: 5432
echo       Usuario: postgres
echo       Base de datos: turnero_peluqueria
echo.
echo ═══════════════════════════════════════════════════════════
echo 📝 COMANDOS ÚTILES:
echo ═══════════════════════════════════════════════════════════
echo.
echo    Ver logs en tiempo real:
echo       docker-compose logs -f
echo.
echo    Ver logs del backend:
echo       docker-compose logs -f backend
echo.
echo    Ver logs del frontend:
echo       docker-compose logs -f frontend
echo.
echo    Detener todo:
echo       docker-compose down
echo.
echo    Reiniciar un servicio:
echo       docker-compose restart backend
echo.
echo ═══════════════════════════════════════════════════════════
echo.

REM Preguntar si quiere ver los logs
choice /C SN /M "¿Quieres ver los logs en tiempo real?"
if errorlevel 2 goto end
if errorlevel 1 goto logs

:logs
echo.
echo 📜 Mostrando logs... (Presiona Ctrl+C para salir)
echo.
docker-compose logs -f

:end
echo.
pause
