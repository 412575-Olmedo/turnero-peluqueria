# 🚀 Configuración Completa para DonWeb - Turnero Peluquería

## 📋 Resumen

Esta guía te ayudará a desplegar tu sistema completo (Frontend Angular + Backend Spring Boot + PostgreSQL) en el VPS de Docker de DonWeb.

---

## 🎯 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────┐
│              DonWeb VPS Docker                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Frontend    │  │   Backend    │            │
│  │  (Angular)   │──▶│ (Spring Boot)│            │
│  │  Puerto 80   │  │  Puerto 8080 │            │
│  └──────────────┘  └──────┬───────┘            │
│                            │                     │
│                            ▼                     │
│                    ┌──────────────┐             │
│                    │  PostgreSQL  │             │
│                    │  Puerto 5432 │             │
│                    └──────────────┘             │
│                                                  │
└─────────────────────────────────────────────────┘
          │
          ▼
    tu-dominio.donweb.com
```

---

## 📝 Paso 1: Preparar Variables de Entorno

### 1.1 Editar el archivo `.env` en la raíz del proyecto

Abre el archivo `.env` y configura las siguientes variables:

```bash
# ===========================================
# BASE DE DATOS POSTGRESQL
# ===========================================
POSTGRES_DB=turnero_peluqueria
POSTGRES_USER=postgres
POSTGRES_PASSWORD=TuPasswordSuperSegura2024!
DB_URL=jdbc:postgresql://db:5432/turnero_peluqueria
DB_USERNAME=postgres
DB_PASSWORD=TuPasswordSuperSegura2024!

# ===========================================
# BACKEND (SPRING BOOT)
# ===========================================
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=tu-clave-super-secreta-minimo-64-caracteres-aleatorios-para-jwt
JWT_EXPIRATION=86400000
APP_URL=http://tu-dominio.donweb.com
APP_NAME=Turnero Peluquería
APP_DESC=Sistema de gestión de turnos
APP_VERSION=1.0.0

# ===========================================
# FRONTEND (ANGULAR)
# ===========================================
# IMPORTANTE: Esta URL debe apuntar al backend
# Si DonWeb te da un dominio: usar http://tu-dominio.donweb.com:8080/api
# Si usas IP: http://TU_IP:8080/api
API_URL=http://tu-dominio.donweb.com:8080/api

# ===========================================
# PUERTOS EXTERNOS
# ===========================================
DB_EXTERNAL_PORT=5432
BACKEND_EXTERNAL_PORT=8080
FRONTEND_EXTERNAL_PORT=80

# ===========================================
# WHATSAPP (EVOLUTION API) - OPCIONAL
# ===========================================
EVOLUTION_WHATSAPP_ENABLED=true
EVOLUTION_API_BASE_URL=http://evolution:8080
EVOLUTION_INSTANCE=turnero
EVOLUTION_API_KEY=tu-api-key-segura
EVOLUTION_EXTERNAL_PORT=8085
```

### 1.2 Generar JWT_SECRET seguro

En Windows PowerShell:
```powershell
# Generar una cadena aleatoria de 64 caracteres
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

O puedes usar cualquier generador online: https://generate-random.org/api-token-generator

---

## 🐳 Paso 2: Subir el Código a DonWeb

### 2.1 Opciones para subir el código

**Opción A: Git (Recomendado)**
```bash
# En tu VPS de DonWeb (conectado por SSH)
git clone https://github.com/tu-usuario/turnero-peluqueria.git
cd turnero-peluqueria
```

**Opción B: FTP/SFTP**
- Usa FileZilla o WinSCP para subir toda la carpeta `turnero-peluqueria`
- Sube el archivo `.env` con tus configuraciones

**Opción C: Panel de DonWeb**
- Algunos planes permiten subir archivos directamente desde el panel

---

## 🚀 Paso 3: Desplegar con Docker Compose

### 3.1 Conectarse al VPS por SSH

```bash
ssh usuario@tu-dominio.donweb.com
# O
ssh usuario@IP_DEL_VPS
```

### 3.2 Verificar que Docker esté instalado

```bash
docker --version
docker-compose --version
```

### 3.3 Navegar al directorio del proyecto

```bash
cd turnero-peluqueria
```

### 3.4 Dar permisos al script de despliegue (Linux)

```bash
chmod +x deploy-donweb.sh
```

### 3.5 Ejecutar el despliegue

**Linux/Mac:**
```bash
./deploy-donweb.sh
```

**Windows (si tienes acceso PowerShell en el VPS):**
```powershell
.\deploy-donweb.ps1
```

**Manual (funciona en todos):**
```bash
# Detener contenedores existentes (si los hay)
docker-compose down

# Construir las imágenes
docker-compose build --no-cache

# Iniciar los servicios
docker-compose up -d

# Ver el estado
docker-compose ps

# Ver los logs
docker-compose logs -f
```

---

## ✅ Paso 4: Verificar el Despliegue

### 4.1 Verificar que los contenedores estén corriendo

```bash
docker-compose ps
```

Deberías ver algo como:
```
NAME                    STATUS              PORTS
turnero-frontend        Up 2 minutes        0.0.0.0:80->80/tcp
turnero-backend         Up 2 minutes        0.0.0.0:8080->8080/tcp
turnero-db              Up 3 minutes        0.0.0.0:5432->5432/tcp
turnero-evolution       Up 2 minutes        0.0.0.0:8085->8080/tcp
```

### 4.2 Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### 4.3 Probar las URLs

Abre tu navegador y verifica:

1. **Frontend (Página principal):**
   ```
   http://tu-dominio.donweb.com
   ```
   O
   ```
   http://TU_IP_DEL_VPS
   ```

2. **Backend (Health Check):**
   ```
   http://tu-dominio.donweb.com:8080/actuator/health
   ```

3. **Backend (Swagger/API Docs):**
   ```
   http://tu-dominio.donweb.com:8080/swagger-ui.html
   ```

4. **Endpoint de servicios:**
   ```
   http://tu-dominio.donweb.com:8080/api/servicios
   ```

---

## 🎨 Paso 5: Acceder a la Aplicación

### 5.1 Pantalla Principal (Clientes)

```
http://tu-dominio.donweb.com
```

Esta es la pantalla donde los clientes pueden:
- Seleccionar sucursal
- Ver servicios disponibles
- Elegir fecha y hora
- Reservar un turno

### 5.2 Panel de Administración

```
http://tu-dominio.donweb.com/admin
```

Usuario por defecto: `admin` / `admin123`

### 5.3 Panel de Empleados

```
http://tu-dominio.donweb.com/empleado
```

---

## 🔧 Comandos Útiles

### Ver logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Reiniciar un servicio
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Detener todo
```bash
docker-compose down
```

### Iniciar todo
```bash
docker-compose up -d
```

### Reconstruir después de cambios
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup de la base de datos
```bash
docker-compose exec db pg_dump -U postgres turnero_peluqueria > backup_$(date +%Y%m%d).sql
```

### Restaurar backup
```bash
cat backup_20240329.sql | docker-compose exec -T db psql -U postgres turnero_peluqueria
```

---

## 🔒 Paso 6: Configuración de Seguridad (Importante)

### 6.1 Firewall en DonWeb

Asegúrate de que el firewall permita:
- Puerto 80 (HTTP) - Frontend
- Puerto 8080 (HTTP) - Backend API
- Puerto 22 (SSH) - Acceso remoto

**NO exponer públicamente:**
- Puerto 5432 (PostgreSQL) - Solo interno entre contenedores
- Puerto 8085 (Evolution API) - Solo interno

### 6.2 Cambiar contraseñas por defecto

Si usaste las contraseñas de ejemplo, **CÁMBIALAS INMEDIATAMENTE** en el archivo `.env`:
- `POSTGRES_PASSWORD`
- `DB_PASSWORD`
- `JWT_SECRET`
- `EVOLUTION_API_KEY`

Después de cambiar, reinicia:
```bash
docker-compose down
docker-compose up -d
```

---

## 🆘 Solución de Problemas

### Problema 1: Frontend carga pero no muestra datos

**Causa:** El frontend no puede conectarse al backend.

**Solución:**
1. Verifica que `API_URL` en `.env` sea correcto:
   ```bash
   API_URL=http://tu-dominio.donweb.com:8080/api
   ```
2. Reinicia el frontend:
   ```bash
   docker-compose restart frontend
   ```

### Problema 2: Error "Cannot connect to database"

**Causa:** Backend no puede conectarse a PostgreSQL.

**Solución:**
1. Verifica que la base de datos esté corriendo:
   ```bash
   docker-compose ps db
   ```
2. Verifica los logs:
   ```bash
   docker-compose logs db
   ```
3. Reinicia la base de datos:
   ```bash
   docker-compose restart db
   ```

### Problema 3: "502 Bad Gateway" en el frontend

**Causa:** Nginx no puede alcanzar la aplicación.

**Solución:**
```bash
docker-compose logs frontend
docker-compose restart frontend
```

### Problema 4: Backend no inicia

**Causa:** Posiblemente falta memoria RAM o error en variables.

**Solución:**
1. Ver logs detallados:
   ```bash
   docker-compose logs backend
   ```
2. Verificar memoria disponible:
   ```bash
   docker stats
   ```

### Problema 5: "Port already in use"

**Causa:** El puerto ya está siendo usado por otro servicio.

**Solución:**
```bash
# Ver qué proceso usa el puerto 8080
sudo lsof -i :8080

# O cambiar el puerto en .env
BACKEND_EXTERNAL_PORT=8081
```

---

## 📊 Monitoreo

### Ver estado de servicios
```bash
docker-compose ps
```

### Ver uso de recursos
```bash
docker stats
```

### Ver logs en tiempo real
```bash
docker-compose logs -f
```

### Verificar conectividad interna
```bash
# Entrar al contenedor del backend
docker-compose exec backend sh

# Probar conexión a la base de datos
curl http://db:5432
```

---

## 🎉 ¡Listo!

Si todo funcionó correctamente, tu sistema debería estar completamente operativo en:

- **Frontend:** http://tu-dominio.donweb.com
- **Backend API:** http://tu-dominio.donweb.com:8080/api
- **Swagger Docs:** http://tu-dominio.donweb.com:8080/swagger-ui.html

Los clientes pueden entrar directamente a la URL principal y comenzar a reservar turnos.

---

## 📚 Documentación Adicional

- [QUICK-START-DONWEB.md](./QUICK-START-DONWEB.md) - Inicio rápido
- [DOCKER-GUIDE.md](./DOCKER-GUIDE.md) - Guía completa de Docker
- [ENV-VARIABLES-GUIDE.md](./ENV-VARIABLES-GUIDE.md) - Variables de entorno
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - Checklist de despliegue

---

## 💡 Consejos Finales

1. **Backups:** Configura backups automáticos de la base de datos
2. **SSL/HTTPS:** Considera agregar un certificado SSL con Let's Encrypt
3. **Dominio personalizado:** Si quieres, puedes configurar tu propio dominio
4. **Monitoreo:** Configura alertas para cuando el servidor caiga
5. **Logs:** Revisa los logs periódicamente para detectar errores

---

¿Necesitas ayuda? Revisa la sección de **Solución de Problemas** o contacta al soporte de DonWeb.
