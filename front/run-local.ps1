# Script para correr el frontend de Angular

cd "C:\Users\thiag\OneDrive\Escritorio\turnero-peluqueria\front"

# Instalar dependencias si es necesario
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias de npm..."
    npm install
}

# Iniciar servidor de desarrollo
npm start
