# 🚀 Quick Start - Despliegue en DonWeb

## Pasos Rápidos

### 1. Preparación (5 minutos)

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Editar .env con tus valores de producción
nano .env  # o tu editor favorito
```

**Variables importantes:**
- `POSTGRES_PASSWORD`: Contraseña segura para BD
- `DB_PASSWORD`: Misma que POSTGRES_PASSWORD
- `JWT_SECRET`: Generar con: `openssl rand -base64 64`
- `API_URL`: URL de tu backend en producción

### 2. Despliegue (2 minutos)

```bash
# Linux/Mac
chmod +x deploy-donweb.sh
./deploy-donweb.sh

# Windows
deploy-donweb.bat
```

### 3. Verificar (1 minuto)

```bash
# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🌐 URLs de Acceso

- Frontend: `http://tu-dominio`
- Backend API: `http://tu-dominio:8080/api`
- Swagger: `http://tu-dominio:8080/swagger-ui.html`
- Health: `http://tu-dominio:8080/actuator/health`

## 📝 Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar un servicio
docker-compose -f docker-compose.prod.yml restart backend

# Detener todo
docker-compose -f docker-compose.prod.yml down

# Backup de BD
./backup-db.sh
```

## 🔧 Actualizar Aplicación

```bash
# Obtener últimos cambios
git pull origin main

# Detener, reconstruir e iniciar
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Documentación Completa

- [DOCKER-GUIDE.md](./DOCKER-GUIDE.md) - Guía completa de Docker
- [DEPLOYMENT-DONWEB.md](./DEPLOYMENT-DONWEB.md) - Guía detallada DonWeb

## ⚠️ Importante

1. **NUNCA** commitear el archivo `.env` con contraseñas reales
2. Usar contraseñas y JWT_SECRET **fuertes y únicos**
3. Hacer backups periódicos de la base de datos
4. Configurar firewall permitiendo solo puertos 80, 443 y 22

## 🆘 Problemas Comunes

### Backend no inicia
```bash
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml restart backend
```

### Frontend no carga
```bash
docker-compose -f docker-compose.prod.yml logs frontend
# Verificar que API_URL en .env sea correcto
```

### Base de datos no conecta
```bash
docker-compose -f docker-compose.prod.yml logs db
docker-compose -f docker-compose.prod.yml restart db
```

---

¿Necesitas ayuda? Revisa [DEPLOYMENT-DONWEB.md](./DEPLOYMENT-DONWEB.md) para instrucciones detalladas.
