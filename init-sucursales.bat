@echo off
REM Script para inicializar la base de datos con datos de sucursales
REM Ejecutar este script después de docker-compose up para cargar datos de sucursales

echo Inicializando base de datos con datos de sucursales...
echo.

docker exec -i turnero-db psql -U postgres -d turnero_peluqueria < initial-scaffolding\src\main\resources\sucursales-init.sql

echo.
echo ✅ Base de datos inicializada correctamente!
echo.
echo Resumen de sucursales creadas:
docker exec turnero-db psql -U postgres -d turnero_peluqueria -c "SELECT s.id, s.nombre as sucursal, s.localidad, s.telefono, COUNT(DISTINCT e.id) as empleados, COUNT(DISTINCT sv.id) as servicios FROM sucursales s LEFT JOIN empleados e ON e.sucursal_id = s.id LEFT JOIN servicios sv ON sv.sucursal_id = s.id WHERE s.activo = true GROUP BY s.id, s.nombre, s.localidad, s.telefono ORDER BY s.id;"

pause
