# 🐳 Guía Completa de Dockerización

Esta guía te ayudará a dockerizar y desplegar la aplicación Turnero Peluquería en cualquier hosting de Docker, incluyendo DonWeb.

## 📦 Archivos Docker Creados

```
turnero-peluqueria/
├── .dockerignore                      # Archivos a ignorar en imágenes Docker
├── .env.example                       # Template de variables de entorno
├── docker-compose.yml                 # Configuración para desarrollo/local
├── docker-compose.prod.yml            # Configuración para producción
├── init-db.sql                        # Script de inicialización de BD
├── deploy-donweb.sh                   # Script de despliegue Linux/Mac
├── deploy-donweb.bat                  # Script de despliegue Windows
├── backup-db.sh                       # Script de backup de BD
├── DEPLOYMENT-DONWEB.md              # Guía detallada de despliegue
│
├── front/
│   ├── Dockerfile                     # Imagen del frontend Angular
│   ├── .dockerignore                 # Archivos a ignorar
│   ├── nginx.conf                     # Configuración de Nginx
│   └── docker-entrypoint.sh          # Script de inicialización
│
└── initial-scaffolding/
    ├── Dockerfile                     # Imagen del backend Spring Boot
    ├── .dockerignore                 # Archivos a ignorar
    └── src/main/resources/
        └── application-prod.properties # Configuración de producción
```

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env  # o usar tu editor favorito
```

### 2. Desplegar Localmente (Desarrollo)

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 3. Desplegar en Producción (DonWeb)

```bash
# Linux/Mac
chmod +x deploy-donweb.sh
./deploy-donweb.sh

# Windows
deploy-donweb.bat
```

## 🔧 Configuración de Variables de Entorno

Edita el archivo `.env` con tus valores de producción:

```env
# Base de Datos
POSTGRES_DB=turnero_peluqueria
POSTGRES_USER=turnero_user
POSTGRES_PASSWORD=TU_CONTRASEÑA_SEGURA

# Backend
DB_URL=jdbc:postgresql://db:5432/turnero_peluqueria
DB_USERNAME=turnero_user
DB_PASSWORD=TU_CONTRASEÑA_SEGURA
JWT_SECRET=CLAVE_SUPER_SEGURA_64_CARACTERES_MINIMO
JWT_EXPIRATION=86400000

# Frontend
API_URL=http://tu-dominio:8080/api
NGINX_HOST=tu-dominio.com

# Puertos
DB_EXTERNAL_PORT=5432
BACKEND_EXTERNAL_PORT=8080
FRONTEND_EXTERNAL_PORT=80
```

### Generar Claves Seguras

```bash
# JWT Secret (64 caracteres)
openssl rand -base64 64 | tr -d '\n'

# Contraseña de BD (32 caracteres)
openssl rand -base64 32 | tr -d '\n'
```

## 📋 Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios (desarrollo)
docker-compose up -d

# Iniciar servicios (producción)
docker-compose -f docker-compose.prod.yml up -d

# Detener servicios
docker-compose down

# Reconstruir después de cambios
docker-compose up --build -d

# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Actualizaciones

```bash
# Actualizar solo el frontend
docker-compose build frontend
docker-compose up -d frontend

# Actualizar solo el backend
docker-compose build backend
docker-compose up -d backend

# Actualizar todo
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Base de Datos

```bash
# Crear backup
./backup-db.sh

# Conectarse a la BD
docker-compose exec db psql -U turnero_user turnero_peluqueria

# Ejecutar SQL desde archivo
docker-compose exec -T db psql -U turnero_user turnero_peluqueria < script.sql

# Ver logs de PostgreSQL
docker-compose logs -f db
```

### Debugging

```bash
# Entrar al contenedor del backend
docker-compose exec backend sh

# Entrar al contenedor del frontend
docker-compose exec frontend sh

# Entrar al contenedor de la BD
docker-compose exec db sh

# Ver recursos utilizados
docker stats

# Inspeccionar red
docker network inspect turnero-peluqueria_turnero-network

# Ver volúmenes
docker volume ls
```

## 🌐 Acceso a los Servicios

### Desarrollo Local

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **PostgreSQL**: localhost:5432
- **Health Check**: http://localhost:8080/actuator/health

### Producción

- **Frontend**: http://tu-dominio
- **Backend API**: http://tu-dominio:8080/api
- **Swagger UI**: http://tu-dominio:8080/swagger-ui.html

## 🔒 Seguridad

### Checklist de Seguridad

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Usar JWT_SECRET único y fuerte (64+ caracteres)
- [ ] No commitear archivo `.env` al repositorio
- [ ] Configurar firewall del servidor
- [ ] Configurar HTTPS/SSL
- [ ] Configurar backups automáticos
- [ ] Limitar acceso a puertos solo necesarios

### Configurar Firewall (Ubuntu/Debian)

```bash
# Permitir solo puertos necesarios
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

## 🗄️ Backups

### Backup Manual

```bash
# Crear backup con timestamp
./backup-db.sh
```

### Backup Automático Diario

```bash
# Agregar a crontab (ejecutar a las 2 AM diariamente)
crontab -e

# Agregar esta línea:
0 2 * * * cd /ruta/proyecto && ./backup-db.sh
```

### Restaurar Backup

```bash
# Descomprimir y restaurar
gunzip < backups/backup_20260122_120000.sql.gz | \
  docker-compose exec -T db psql -U turnero_user turnero_peluqueria
```

## 📊 Monitoreo

### Health Checks

```bash
# Backend health
curl http://localhost:8080/actuator/health

# Frontend health
curl http://localhost

# Database health
docker-compose exec db pg_isready -U turnero_user
```

### Ver Métricas de Recursos

```bash
# Uso en tiempo real
docker stats

# Espacio en disco
docker system df

# Logs del sistema
journalctl -u docker
```

## 🐛 Solución de Problemas

### El Backend No Inicia

```bash
# Ver logs detallados
docker-compose logs backend

# Verificar conectividad con BD
docker-compose exec backend ping db

# Reiniciar
docker-compose restart backend
```

### El Frontend No Carga

```bash
# Verificar variables de entorno
docker-compose exec frontend env | grep API_URL

# Ver logs de Nginx
docker-compose logs frontend

# Verificar archivos servidos
docker-compose exec frontend ls -la /usr/share/nginx/html
```

### Problemas de Base de Datos

```bash
# Ver logs
docker-compose logs db

# Verificar conexión
docker-compose exec db pg_isready

# Reiniciar BD
docker-compose restart db
```

### Limpiar Todo y Empezar de Nuevo

```bash
# CUIDADO: Esto elimina volúmenes (base de datos)
docker-compose down -v
docker system prune -a
docker-compose up -d
```

## 📚 Documentación Adicional

- [DEPLOYMENT-DONWEB.md](./DEPLOYMENT-DONWEB.md) - Guía específica para DonWeb
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía general de despliegue
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del proyecto
- [BEST-PRACTICES.md](./BEST-PRACTICES.md) - Mejores prácticas

## 🆘 Soporte

Para problemas específicos:
- **Docker**: https://docs.docker.com/
- **DonWeb**: Soporte técnico de DonWeb
- **Spring Boot**: https://spring.io/guides
- **Angular**: https://angular.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs/

## ✅ Checklist de Despliegue

Antes de desplegar a producción:

- [ ] `.env` configurado con valores de producción
- [ ] Contraseñas seguras generadas
- [ ] JWT_SECRET configurado (64+ caracteres)
- [ ] Dominio configurado (si aplica)
- [ ] Firewall configurado
- [ ] Backups automáticos configurados
- [ ] SSL/HTTPS configurado (si aplica)
- [ ] Variables de entorno verificadas
- [ ] Tests pasando
- [ ] Logs configurados
- [ ] Monitoreo configurado

## 🎉 ¡Listo!

Tu aplicación está dockerizada y lista para desplegarse en DonWeb o cualquier otro hosting de Docker.

Para desplegar:
```bash
./deploy-donweb.sh  # Linux/Mac
# o
deploy-donweb.bat   # Windows
```
