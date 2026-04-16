# 🚀 Comandos Esenciales - DonWeb

## 📌 Guía Rápida de Comandos

### 1️⃣ Conectar al VPS

```bash
# Por SSH
ssh usuario@tu-dominio.donweb.com
# O por IP
ssh usuario@192.168.X.X
```

---

### 2️⃣ Primera Vez - Despliegue Inicial

```bash
# 1. Navegar al directorio
cd turnero-peluqueria

# 2. Verificar que existe .env
ls -la .env

# 3. Construir e iniciar todo
docker-compose up -d --build

# 4. Ver el estado
docker-compose ps

# 5. Ver logs
docker-compose logs -f
```

---

### 3️⃣ Comandos del Día a Día

#### Ver estado de servicios
```bash
docker-compose ps
```

#### Ver logs en tiempo real
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

#### Reiniciar un servicio
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db
```

#### Detener todo
```bash
docker-compose down
```

#### Iniciar todo
```bash
docker-compose up -d
```

---

### 4️⃣ Actualizar la Aplicación

```bash
# 1. Obtener últimos cambios (si usas Git)
git pull origin main

# 2. Detener servicios
docker-compose down

# 3. Reconstruir imágenes
docker-compose build --no-cache

# 4. Iniciar servicios
docker-compose up -d

# 5. Verificar
docker-compose ps
docker-compose logs -f
```

---

### 5️⃣ Backup de Base de Datos

#### Crear backup
```bash
# Formato: backup_YYYYMMDD.sql
docker-compose exec db pg_dump -U postgres turnero_peluqueria > backup_$(date +%Y%m%d).sql
```

#### Restaurar backup
```bash
cat backup_20240329.sql | docker-compose exec -T db psql -U postgres turnero_peluqueria
```

#### Listar backups
```bash
ls -lh backup_*.sql
```

---

### 6️⃣ Ver Uso de Recursos

```bash
# Ver uso de CPU, RAM, Red
docker stats

# Ver uso de disco
df -h

# Ver espacio de Docker
docker system df
```

---

### 7️⃣ Limpiar Docker

```bash
# Limpiar imágenes no usadas
docker image prune -a

# Limpiar contenedores detenidos
docker container prune

# Limpiar todo (¡CUIDADO!)
docker system prune -a --volumes
```

---

### 8️⃣ Acceder a un Contenedor

```bash
# Entrar al backend
docker-compose exec backend sh

# Entrar a la base de datos
docker-compose exec db psql -U postgres turnero_peluqueria

# Entrar al frontend
docker-compose exec frontend sh
```

---

### 9️⃣ Ver Variables de Entorno

```bash
# Ver archivo .env
cat .env

# Ver variables del backend
docker-compose exec backend env | grep -E "DB_|JWT_|API_"
```

---

### 🔟 Solución Rápida de Problemas

#### Backend no inicia
```bash
# Ver logs
docker-compose logs backend

# Reintentar
docker-compose restart backend

# Si persiste, reconstruir
docker-compose up -d --build backend
```

#### Frontend muestra error 502
```bash
# Verificar que backend esté corriendo
docker-compose ps backend

# Ver logs del frontend
docker-compose logs frontend

# Reiniciar nginx
docker-compose restart frontend
```

#### Base de datos no conecta
```bash
# Ver logs
docker-compose logs db

# Ver si el puerto está escuchando
docker-compose exec db pg_isready -U postgres

# Reiniciar
docker-compose restart db
```

#### "No se pueden ver los servicios"
```bash
# 1. Verificar API_URL en .env
cat .env | grep API_URL

# 2. Probar endpoint directamente
curl http://localhost:8080/api/servicios

# 3. Verificar conectividad frontend -> backend
docker-compose exec frontend ping backend
```

---

### 1️⃣1️⃣ Verificaciones de Salud

#### Health Check Backend
```bash
curl http://localhost:8080/actuator/health
```

#### Health Check Frontend
```bash
curl http://localhost:80
```

#### Verificar Base de Datos
```bash
docker-compose exec db pg_isready -U postgres
```

#### Probar API
```bash
# Listar servicios
curl http://localhost:8080/api/servicios

# Listar sucursales
curl http://localhost:8080/api/sucursales

# Verificar Swagger
curl http://localhost:8080/swagger-ui.html
```

---

### 1️⃣2️⃣ Comandos de Seguridad

#### Ver puertos abiertos
```bash
sudo netstat -tulpn | grep LISTEN
```

#### Ver firewall (si ufw está instalado)
```bash
sudo ufw status
```

#### Cambiar contraseña de PostgreSQL
```bash
docker-compose exec db psql -U postgres -c "ALTER USER postgres PASSWORD 'nueva_password_segura';"

# Luego actualizar .env y reiniciar
```

---

## 📋 Checklist de Verificación Rápida

```bash
# Ejecuta estos comandos para verificar que todo esté OK
echo "1. Estado de servicios:"
docker-compose ps

echo "2. Health del backend:"
curl -s http://localhost:8080/actuator/health | grep UP

echo "3. Frontend accesible:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:80

echo "4. Base de datos:"
docker-compose exec db pg_isready -U postgres

echo "5. Uso de recursos:"
docker stats --no-stream
```

---

## 🎯 URLs Importantes

```bash
# Frontend (Página principal)
http://tu-dominio.donweb.com

# Backend API
http://tu-dominio.donweb.com:8080/api

# Swagger (Documentación API)
http://tu-dominio.donweb.com:8080/swagger-ui.html

# Health Check
http://tu-dominio.donweb.com:8080/actuator/health

# Panel Admin
http://tu-dominio.donweb.com/admin

# Panel Empleado
http://tu-dominio.donweb.com/empleado
```

---

## 💡 Tips

1. **Alias útiles** - Agrega a tu `~/.bashrc`:
   ```bash
   alias dcup='docker-compose up -d'
   alias dcdown='docker-compose down'
   alias dclogs='docker-compose logs -f'
   alias dcps='docker-compose ps'
   alias dcrestart='docker-compose restart'
   ```

2. **Ver logs de errores solamente:**
   ```bash
   docker-compose logs | grep -i error
   docker-compose logs | grep -i exception
   ```

3. **Monitoreo continuo:**
   ```bash
   watch -n 5 'docker-compose ps'
   ```

---

## 🆘 ¿Algo no funciona?

1. **Ver logs detallados:** `docker-compose logs -f`
2. **Verificar .env:** `cat .env`
3. **Revisar estado:** `docker-compose ps`
4. **Revisar CONFIGURACION-DONWEB.md** para solución de problemas detallada

---

**Última actualización:** $(date)
