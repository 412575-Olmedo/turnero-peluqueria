# Inicialización de Base de Datos con Sucursales

## Resumen de Cambios

Se ha configurado el sistema para soportar múltiples sucursales (branches/locations). Las imágenes Docker han sido reconstruidas y la base de datos se inicializa automáticamente con:

- ✅ 6 sucursales predefinidas (Córdoba y Villa Carlos Paz)
- ✅ Empleados asignados a distintas sucursales
- ✅ Servicios distribuidos entre sucursales
- ✅ Estructura de base de datos actualizada con foreign keys

## Sucursales Creadas

1. **Sucursal Principal** - Av. Principal 123, Córdoba - Tel: 351-123-4567
2. **Sucursal Centro** - Av. Colón 456, Córdoba - Tel: 351-422-3344
3. **Sucursal Nueva Córdoba** - Bv. San Juan 789, Córdoba - Tel: 351-433-5566
4. **Sucursal Alta Córdoba** - Av. Monseñor Pablo Cabrera 1234, Córdoba - Tel: 351-444-7788
5. **Sucursal Cerro de las Rosas** - Rafael Núñez 3456, Córdoba - Tel: 351-455-9900
6. **Sucursal Villa Carlos Paz** - Av. San Martín 567, Villa Carlos Paz - Tel: 3541-422-334

## Iniciar el Sistema

### Opción 1: Inicio Normal (Recomendado)

```bash
# Reconstruir imágenes y levantar contenedores
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Esperar 20-30 segundos para que el backend inicie completamente

# Inicializar datos de sucursales (usar según tu sistema operativo):

# En Linux/Mac:
./init-sucursales.sh

# En Windows:
init-sucursales.bat
```

### Opción 2: Inicio Rápido (Si las imágenes ya están construidas)

```bash
docker-compose down -v
docker-compose up -d

# Esperar 20-30 segundos

# Inicializar datos de sucursales:
./init-sucursales.sh   # o init-sucursales.bat en Windows
```

## Verificar la Inicialización

Para verificar que las sucursales se cargaron correctamente:

```bash
docker exec turnero-db psql -U postgres -d turnero_peluqueria -c "SELECT id, nombre, localidad, telefono FROM sucursales ORDER BY id;"
```

Para ver el detalle completo con empleados y servicios:

```bash
docker exec turnero-db psql -U postgres -d turnero_peluqueria -c "
  SELECT
    s.nombre as sucursal,
    s.localidad,
    COUNT(DISTINCT e.id) as empleados,
    COUNT(DISTINCT sv.id) as servicios
  FROM sucursales s
  LEFT JOIN empleados e ON e.sucursal_id = s.id
  LEFT JOIN servicios sv ON sv.sucursal_id = s.id
  GROUP BY s.id, s.nombre, s.localidad
  ORDER BY s.nombre;
"
```

## Archivos Modificados

### Scripts SQL
- `initial-scaffolding/src/main/resources/sucursales-init.sql` - Script de inicialización de sucursales
- `init-db.sql` - Script base de PostgreSQL (configuración de extensiones)

### Configuración Spring Boot
- `application.properties` - Agregado `spring.jpa.defer-datasource-initialization=true`
- `application-prod.properties` - Configuración de carga de scripts SQL
- `application-dev.properties` - Configuración para desarrollo

### Docker
- `docker-compose.yml` - Agregado volumen para init-db.sql
- Imágenes reconstruidas con nuevas configuraciones

### Scripts de Utilidad
- `init-sucursales.sh` - Script de inicialización para Linux/Mac
- `init-sucursales.bat` - Script de inicialización para Windows

## Estructura de Base de Datos

Las siguientes tablas ahora incluyen el campo `sucursal_id`:
- `empleados` - Cada empleado pertenece a una sucursal
- `turnos` - Cada turno está asociado a una sucursal
- `servicios` - Los servicios pueden estar disponibles en distintas sucursales
- `productos` - Los productos pueden estar disponibles en distintas sucursales

## Notas Importantes

1. **Primera vez**: Usar los scripts de inicialización (`init-sucursales.sh` o `.bat`) después de levantar los contenedores
2. **Datos de prueba**: Los empleados existentes (Carlos, Ana, Luis) están distribuidos entre las primeras 3 sucursales
3. **Idempotente**: Los scripts pueden ejecutarse múltiples veces sin problemas (usan `IF NOT EXISTS` y `ON CONFLICT`)
4. **Personalización**: Para modificar las sucursales, editar `sucursales-init.sql`

## Solución de Problemas

### La base de datos no tiene sucursales
Ejecutar el script de inicialización:
```bash
./init-sucursales.sh  # o .bat en Windows
```

### Los contenedores no inician
Verificar logs:
```bash
docker logs turnero-backend
docker logs turnero-db
docker logs turnero-frontend
```

### Reiniciar desde cero
```bash
docker-compose down -v  # Elimina volúmenes
docker-compose build --no-cache  # Reconstruye imágenes
docker-compose up -d  # Inicia contenedores
./init-sucursales.sh  # Inicializa sucursales
```

## Acceso al Sistema

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health
- **Base de Datos**: localhost:5432 (usuario: postgres, db: turnero_peluqueria)

## Usuarios de Prueba

- **Admin**: admin / password
- **Empleados**:
  - carlos / password (Sucursal Principal)
  - ana / password (Sucursal Centro)
  - luis / password (Sucursal Nueva Córdoba)
- **Clientes**:
  - cliente1 / password
  - cliente2 / password
