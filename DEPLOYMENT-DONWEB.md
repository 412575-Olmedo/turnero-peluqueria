# 🚀 Guía de Despliegue en DonWeb con Docker

## 📋 Requisitos Previos

- Cuenta en DonWeb con servicio de Docker Hosting
- Acceso SSH al servidor
- Git instalado en el servidor
- Docker y Docker Compose instalados (generalmente ya vienen preinstalados)

## 🔧 Configuración Inicial

### 1. Preparar Variables de Entorno

Crear un archivo `.env` en el servidor con las variables de producción:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus valores de producción
nano .env
```

**Variables importantes a configurar:**

```env
# Base de datos
POSTGRES_DB=turnero_peluqueria
POSTGRES_USER=turnero_user
POSTGRES_PASSWORD=TU_CONTRASEÑA_SEGURA_AQUI

# Backend
DB_URL=jdbc:postgresql://db:5432/turnero_peluqueria
DB_USERNAME=turnero_user
DB_PASSWORD=TU_CONTRASEÑA_SEGURA_AQUI
JWT_SECRET=CLAVE_SUPER_SEGURA_MINIMO_64_CARACTERES_ALEATORIOS_AQUI
JWT_EXPIRATION=86400000

# Frontend
API_URL=http://TU_DOMINIO:8080/api
NGINX_HOST=TU_DOMINIO

# Puertos (ajustar según DonWeb)
DB_EXTERNAL_PORT=5432
BACKEND_EXTERNAL_PORT=8080
FRONTEND_EXTERNAL_PORT=80
```

### 2. Subir el Proyecto al Servidor

**Opción A: Usando Git (recomendado)**

```bash
# En el servidor DonWeb
cd /ruta/donde/quieras/el/proyecto
git clone TU_REPOSITORIO_GIT
cd turnero-peluqueria
```

**Opción B: Usando SFTP**

- Comprimir el proyecto localmente (sin node_modules ni target)
- Subir el .zip al servidor vía SFTP
- Descomprimir en el servidor

### 3. Generar Claves Seguras

```bash
# Generar JWT_SECRET seguro (64 caracteres aleatorios)
openssl rand -base64 64 | tr -d '\n'

# Generar contraseña de base de datos
openssl rand -base64 32 | tr -d '\n'
```

## 🐳 Despliegue con Docker

### Construcción y Despliegue Inicial

```bash
# Asegurarse de estar en el directorio del proyecto
cd turnero-peluqueria

# Construcción de imágenes
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f
```

### Verificar que Todo Esté Funcionando

```bash
# Ver estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Verificar salud de los servicios
docker-compose -f docker-compose.prod.yml exec backend wget -qO- http://localhost:8080/actuator/health
docker-compose -f docker-compose.prod.yml exec frontend wget -qO- http://localhost:80

# Ver logs específicos
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f db
```

## 🔄 Actualizaciones

### Actualizar la Aplicación

```bash
# Detener servicios
docker-compose -f docker-compose.prod.yml down

# Obtener última versión del código
git pull origin main

# Reconstruir imágenes
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Actualizar Solo el Frontend

```bash
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

### Actualizar Solo el Backend

```bash
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml up -d backend
```

## 🗄️ Gestión de Base de Datos

### Backup de Base de Datos

```bash
# Crear backup
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U turnero_user turnero_peluqueria > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup con compresión
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U turnero_user turnero_peluqueria | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restaurar Base de Datos

```bash
# Restaurar desde backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U turnero_user turnero_peluqueria < backup_20260122_120000.sql

# Restaurar desde backup comprimido
gunzip < backup_20260122_120000.sql.gz | docker-compose -f docker-compose.prod.yml exec -T db psql -U turnero_user turnero_peluqueria
```

### Conectarse a la Base de Datos

```bash
docker-compose -f docker-compose.prod.yml exec db psql -U turnero_user turnero_peluqueria
```

## 📊 Monitoreo y Mantenimiento

### Ver Recursos Utilizados

```bash
# Ver uso de CPU y memoria
docker stats

# Ver espacio en disco
docker system df
```

### Limpiar Recursos No Utilizados

```bash
# Limpiar imágenes antiguas
docker image prune -a

# Limpiar todo (excepto volúmenes)
docker system prune -a

# CUIDADO: Esto elimina volúmenes (base de datos)
docker system prune -a --volumes
```

### Logs y Debugging

```bash
# Ver últimas 100 líneas de logs
docker-compose -f docker-compose.prod.yml logs --tail=100

# Logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs -f backend

# Entrar al contenedor para debugging
docker-compose -f docker-compose.prod.yml exec backend sh
docker-compose -f docker-compose.prod.yml exec frontend sh
```

## 🔒 Seguridad

### Recomendaciones de Seguridad

1. **Nunca commitear el archivo `.env` con credenciales reales**
2. **Cambiar todas las contraseñas por defecto**
3. **Usar JWT_SECRET único y fuerte (mínimo 64 caracteres)**
4. **Configurar firewall del servidor**:
   ```bash
   # Solo permitir puertos necesarios
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 22/tcp  # SSH
   ufw enable
   ```

5. **Backups automáticos diarios**:
   ```bash
   # Agregar a crontab
   0 2 * * * cd /ruta/proyecto && docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U turnero_user turnero_peluqueria | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
   ```

## 🌐 Configuración de Dominio

### Configurar HTTPS con Let's Encrypt (Opcional)

Si DonWeb no proporciona certificados SSL automáticos:

1. Instalar Certbot
2. Obtener certificado
3. Configurar nginx para HTTPS

```bash
# Instalar certbot
apt-get install certbot

# Obtener certificado
certbot certonly --standalone -d tu-dominio.com

# Los certificados estarán en:
# /etc/letsencrypt/live/tu-dominio.com/fullchain.pem
# /etc/letsencrypt/live/tu-dominio.com/privkey.pem
```

## 🆘 Solución de Problemas

### El Backend No Inicia

```bash
# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs backend

# Verificar conectividad con la base de datos
docker-compose -f docker-compose.prod.yml exec backend ping db

# Reiniciar backend
docker-compose -f docker-compose.prod.yml restart backend
```

### El Frontend No Muestra Datos

1. Verificar que `API_URL` en `.env` sea correcto
2. Verificar que el backend esté funcionando
3. Revisar logs del navegador (F12 → Console)

### Base de Datos No Acepta Conexiones

```bash
# Verificar que el contenedor esté corriendo
docker-compose -f docker-compose.prod.yml ps db

# Ver logs de PostgreSQL
docker-compose -f docker-compose.prod.yml logs db

# Reiniciar base de datos
docker-compose -f docker-compose.prod.yml restart db
```

## 📞 Contacto y Soporte

Para problemas con DonWeb:
- Soporte técnico de DonWeb
- Documentación oficial de Docker Hosting de DonWeb

## 🎯 Checklist de Despliegue

- [ ] Archivo `.env` creado con valores de producción
- [ ] Contraseñas seguras generadas
- [ ] JWT_SECRET seguro configurado
- [ ] Código subido al servidor
- [ ] Docker Compose ejecutado
- [ ] Servicios health check pasando
- [ ] Base de datos inicializada
- [ ] Frontend accesible desde el navegador
- [ ] Backend API respondiendo
- [ ] Backup de base de datos configurado
- [ ] Firewall configurado
- [ ] Dominio configurado (si aplica)
- [ ] HTTPS configurado (si aplica)
