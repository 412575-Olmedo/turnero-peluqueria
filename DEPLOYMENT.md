# 🚀 Guía de Despliegue

## Comandos Útiles de Docker

### Iniciar todos los servicios
```bash
docker-compose up -d
```

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f db
```

### Detener servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (CUIDADO: borra la BD)
```bash
docker-compose down -v
```

### Reconstruir después de cambios
```bash
docker-compose up --build
```

### Ver estado de los contenedores
```bash
docker-compose ps
```

## Acceso a los Servicios

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **PostgreSQL**: localhost:5432
  - Database: `turnero_peluqueria`
  - User: `postgres`
  - Password: `postgres`

## Datos Iniciales

### Usuarios (usuario/contraseña)
- `admin` / `password` - Administrador
- `cliente1` / `password` - Cliente
- `cliente2` / `password` - Cliente

### Empleados Pre-cargados
1. Carlos Rodríguez - Corte Caballero (09:00 - 18:00)
2. Ana Martínez - Coloración (10:00 - 19:00)
3. Luis Fernández - Barbería Premium (08:00 - 17:00)

### Servicios Pre-cargados
1. Corte de Cabello - 40 min - $5000
2. Barba - 30 min - $3000
3. Coloración - 120 min - $15000
4. Corte + Barba - 60 min - $7000
5. Peinado - 45 min - $4000
6. Tratamiento Capilar - 90 min - $12000

## Probar la API con Swagger

1. Acceder a http://localhost:8080/swagger-ui.html
2. Hacer login en `/api/auth/login` con:
   ```json
   {
     "username": "admin",
     "password": "password"
   }
   ```
3. Copiar el token del response
4. Click en "Authorize" (candado en la esquina superior derecha)
5. Ingresar: `Bearer <token>`
6. Ahora puedes probar todos los endpoints

## Probar Validación de Solapamiento

### Caso 1: Crear turno válido
```
POST /api/turnos
{
  "empleadoId": 1,
  "servicioId": 1,
  "fechaHoraInicio": "2025-01-08T10:00:00",
  "clienteNombre": "Juan Pérez",
  "clienteTelefono": "1234567890"
}
```
✅ Debería crearse exitosamente

### Caso 2: Intentar solapamiento
```
POST /api/turnos
{
  "empleadoId": 1,
  "servicioId": 1,
  "fechaHoraInicio": "2025-01-08T10:20:00",
  "clienteNombre": "María González",
  "clienteTelefono": "0987654321"
}
```
❌ Debería fallar con mensaje de solapamiento
(El primer turno termina a las 10:40, y este empieza a las 10:20)

### Caso 3: Turno en horario laboral inválido
```
POST /api/turnos
{
  "empleadoId": 1,
  "servicioId": 1,
  "fechaHoraInicio": "2025-01-08T19:00:00",
  "clienteNombre": "Pedro López",
  "clienteTelefono": "1122334455"
}
```
❌ Debería fallar (empleado termina a las 18:00)

## Backup de la Base de Datos

### Crear backup
```bash
docker exec turnero-db pg_dump -U postgres turnero_peluqueria > backup.sql
```

### Restaurar backup
```bash
docker exec -i turnero-db psql -U postgres turnero_peluqueria < backup.sql
```

## Monitoreo de Performance

### Ver uso de recursos
```bash
docker stats
```

### Inspeccionar red
```bash
docker network inspect turnero-peluqueria_turnero-network
```

## Troubleshooting

### Backend no arranca
```bash
# Ver logs detallados
docker-compose logs backend

# Verificar que la BD está lista
docker-compose logs db | grep "ready to accept connections"

# Reiniciar solo el backend
docker-compose restart backend
```

### Frontend no carga
```bash
# Verificar logs de nginx
docker-compose logs frontend

# Verificar que el build fue exitoso
docker-compose build frontend
```

### PostgreSQL no conecta
```bash
# Verificar puerto disponible
netstat -an | grep 5432

# Conectarse manualmente
docker exec -it turnero-db psql -U postgres -d turnero_peluqueria
```

## Producción

### Variables de entorno importantes

Para producción, cambiar en docker-compose.yml:

```yaml
backend:
  environment:
    JWT_SECRET: <generar-clave-segura-aquí>
    DB_PASSWORD: <contraseña-segura>
```

### Generar JWT Secret seguro
```bash
openssl rand -base64 64
```

### HTTPS con Let's Encrypt
Para habilitar HTTPS, agregar un contenedor nginx-proxy y certbot.

## Comandos de Mantenimiento

### Limpiar espacio en disco
```bash
# Eliminar imágenes sin usar
docker image prune -a

# Eliminar todo lo que no se está usando
docker system prune -a --volumes
```

### Actualizar una imagen
```bash
docker-compose pull <servicio>
docker-compose up -d <servicio>
```
