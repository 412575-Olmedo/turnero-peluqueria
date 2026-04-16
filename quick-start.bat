@echo off
REM Script de inicio rápido para Windows
REM Ejecutar: quick-start.bat

echo.
echo 🎨 Sistema de Turnos - Peluqueria
echo ==================================
echo.

REM Verificar Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Docker no esta instalado
    echo Por favor, instalar Docker Desktop desde https://www.docker.com/
    pause
    exit /b 1
)

REM Verificar Docker Compose
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Docker Compose no esta instalado
    pause
    exit /b 1
)

echo ✅ Docker encontrado
echo ✅ Docker Compose encontrado
echo.

REM Detener contenedores previos
echo 🧹 Limpiando contenedores previos...
docker-compose down 2>nul

echo.
echo 🏗️  Construyendo imagenes...
docker-compose build

echo.
echo 🚀 Iniciando servicios...
docker-compose up -d

echo.
echo ⏳ Esperando que los servicios esten listos...
echo    (Esto puede tomar 1-2 minutos en el primer inicio)
echo.

REM Esperar 60 segundos para que todo inicie
timeout /t 60 /nobreak >nul

echo.
echo ✅ ¡Sistema iniciado exitosamente!
echo.
echo 📍 URLs de acceso:
echo    Frontend:  http://localhost
echo    Backend:   http://localhost:8080
echo    Swagger:   http://localhost:8080/swagger-ui.html
echo.
echo 👤 Credenciales de prueba:
echo    Usuario Admin:   admin / password
echo    Usuario Cliente: cliente1 / password
echo.
echo 📊 Ver logs en tiempo real:
echo    docker-compose logs -f
echo.
echo 🛑 Detener el sistema:
echo    docker-compose down
echo.
echo 🎉 ¡Listo para usar!
echo.
pause
