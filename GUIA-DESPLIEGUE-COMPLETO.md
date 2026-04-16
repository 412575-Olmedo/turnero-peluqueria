# 🚀 GUÍA: Subir y Desplegar Sistema Completo en DonWeb

## 📦 Lo que vamos a desplegar

```
turnero-peluqueria/
├── initial-scaffolding/    → Backend (Spring Boot)
├── front/                  → Frontend (Angular)
├── docker-compose.yml      → Configuración de Docker
├── .env                    → Variables de entorno
└── init-db.sql            → Inicialización de BD
```

---

## 🎯 Paso 1: Preparar el Código Localmente

### 1.1 Verificar que tienes todo

Abre PowerShell en tu máquina Windows:

```powershell
cd C:\Users\thiag\OneDrive\Escritorio\turnero-peluqueria

# Verificar estructura
ls
```

Deberías ver:
- ✅ Carpeta `initial-scaffolding` (backend)
- ✅ Carpeta `front` (frontend)
- ✅ Archivo `docker-compose.yml`
- ✅ Archivo `.env`
- ✅ Archivo `init-db.sql`

### 1.2 Configurar el archivo `.env` para DonWeb

Abre el archivo `.env` y configura estas variables:

```bash
# ===========================================
# BASE DE DATOS
# ===========================================
POSTGRES_DB=turnero_peluqueria
POSTGRES_USER=postgres
POSTGRES_PASSWORD=TuPasswordSegura2024!     # ⚠️ CAMBIAR
DB_URL=jdbc:postgresql://db:5432/turnero_peluqueria
DB_USERNAME=postgres
DB_PASSWORD=TuPasswordSegura2024!           # ⚠️ CAMBIAR (igual que POSTGRES_PASSWORD)

# ===========================================
# BACKEND
# ===========================================
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=genera-una-clave-super-segura-de-64-caracteres-aleatorios-aqui  # ⚠️ CAMBIAR
JWT_EXPIRATION=86400000
APP_URL=http://tu-dominio.donweb.com        # ⚠️ CAMBIAR por tu dominio
BACKEND_EXTERNAL_PORT=8080

# ===========================================
# FRONTEND - ¡IMPORTANTE!
# ===========================================
# Cambia esto por tu dominio real de DonWeb:
API_URL=http://tu-dominio.donweb.com:8080/api    # ⚠️ CAMBIAR
FRONTEND_EXTERNAL_PORT=80

# ===========================================
# WHATSAPP (Opcional)
# ===========================================
EVOLUTION_WHATSAPP_ENABLED=true
EVOLUTION_API_KEY=tu-api-key-aqui          # ⚠️ CAMBIAR si usas WhatsApp
EVOLUTION_EXTERNAL_PORT=8085

# ===========================================
# OTROS
# ===========================================
DB_EXTERNAL_PORT=5432
```

**Ejemplo real:**
Si tu dominio de DonWeb es `turnero123.donweb.com`:
```bash
APP_URL=http://turnero123.donweb.com
API_URL=http://turnero123.donweb.com:8080/api
```

---

## 🌐 Paso 2: Subir el Código a DonWeb

### Opción A: Con Git (Recomendado)

#### 2.1 Crear repositorio en GitHub

```powershell
cd C:\Users\thiag\OneDrive\Escritorio\turnero-peluqueria

# Inicializar git (si no lo tienes)
git init

# Agregar archivos
git add .

# Commit
git commit -m "Proyecto completo turnero peluquería"

# Crear repo en GitHub y subir
git remote add origin https://github.com/tu-usuario/turnero-peluqueria.git
git push -u origin main
```

#### 2.2 Clonar en DonWeb

```bash
# Conectar por SSH a DonWeb
ssh usuario@tu-dominio.donweb.com

# Clonar el repositorio
git clone https://github.com/tu-usuario/turnero-peluqueria.git
cd turnero-peluqueria
```

### Opción B: Con FTP/SFTP (FileZilla o WinSCP)

1. **Descargar FileZilla:** https://filezilla-project.org/
2. **Conectar a tu VPS:**
   - Host: `tu-dominio.donweb.com` o la IP
   - Usuario: tu usuario SSH
   - Contraseña: tu contraseña SSH
   - Puerto: 22
3. **Subir la carpeta completa:**
   - Arrastra toda la carpeta `turnero-peluqueria` desde tu PC al servidor
   - Asegúrate de incluir el archivo `.env` con tus configuraciones

### Opción C: Con SCP (Desde PowerShell)

```powershell
# Comprimir primero (opcional)
cd C:\Users\thiag\OneDrive\Escritorio
Compress-Archive -Path turnero-peluqueria -DestinationPath turnero-peluqueria.zip

# Subir con SCP
scp -r turnero-peluqueria usuario@tu-dominio.donweb.com:/home/usuario/

# O subir el ZIP
scp turnero-peluqueria.zip usuario@tu-dominio.donweb.com:/home/usuario/
```

---

## 🐳 Paso 3: Desplegar con Docker

### 3.1 Conectar por SSH a DonWeb

```bash
ssh usuario@tu-dominio.donweb.com
```

### 3.2 Navegar al proyecto

```bash
cd turnero-peluqueria

# Si subiste un ZIP, descomprimirlo primero:
# unzip turnero-peluqueria.zip
# cd turnero-peluqueria
```

### 3.3 Verificar que Docker esté instalado

```bash
docker --version
docker-compose --version
```

Si no está instalado, instalarlo:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 3.4 Verificar el archivo .env

```bash
# Ver el contenido
cat .env

# Si necesitas editarlo en el servidor
nano .env
```

**Asegúrate de que `API_URL` tenga el dominio correcto:**
```bash
grep API_URL .env
# Debe mostrar: API_URL=http://tu-dominio-real.donweb.com:8080/api
```

### 3.5 Dar permisos a scripts

```bash
chmod +x deploy-donweb.sh
chmod +x quick-start.sh
```

### 3.6 Desplegar TODO

```bash
# Opción 1: Con el script automático
./deploy-donweb.sh

# Opción 2: Manual (más control)
docker-compose down                    # Detener si hay algo corriendo
docker-compose build --no-cache        # Construir imágenes (toma 5-10 min)
docker-compose up -d                   # Iniciar en background
```

### 3.7 Monitorear el despliegue

```bash
# Ver el progreso
docker-compose logs -f

# Ver solo backend
docker-compose logs -f backend

# Ver solo frontend
docker-compose logs -f frontend

# Presiona Ctrl+C para salir de los logs
```

---

## ✅ Paso 4: Verificar que Todo Funciona

### 4.1 Ver estado de los contenedores

```bash
docker-compose ps
```

Deberías ver algo como:
```
NAME                  STATUS              PORTS
turnero-frontend      Up 3 minutes        0.0.0.0:80->80/tcp
turnero-backend       Up 3 minutes        0.0.0.0:8080->8080/tcp
turnero-db            Up 3 minutes        0.0.0.0:5432->5432/tcp
turnero-evolution     Up 3 minutes        0.0.0.0:8085->8080/tcp
```

Todos deberían estar en estado `Up`.

### 4.2 Probar las URLs

Abre tu navegador y prueba:

1. **Frontend (Página principal):**
   ```
   http://tu-dominio.donweb.com
   ```
   Deberías ver la pantalla de reserva de turnos.

2. **Backend (Health Check):**
   ```
   http://tu-dominio.donweb.com:8080/actuator/health
   ```
   Debería responder: `{"status":"UP"}`

3. **API de Servicios:**
   ```
   http://tu-dominio.donweb.com:8080/api/servicios
   ```
   Debería devolver JSON con los servicios.

4. **Swagger (Documentación API):**
   ```
   http://tu-dominio.donweb.com:8080/swagger-ui.html
   ```

### 4.3 Verificar conectividad Frontend → Backend

```bash
# Desde el servidor, prueba la API
curl http://localhost:8080/api/servicios

# Verifica que el frontend pueda alcanzar el backend
docker-compose exec frontend ping backend
```

---

## 🎨 Paso 5: Probar la Aplicación

### 5.1 Pantalla de Cliente (Reservar Turno)

1. Abre: `http://tu-dominio.donweb.com`
2. Deberías ver:
   - ✅ Selector de sucursal
   - ✅ Lista de servicios
   - ✅ Calendario para elegir fecha y hora
   - ✅ Formulario de reserva

### 5.2 Panel de Administración

1. Abre: `http://tu-dominio.donweb.com/admin`
2. Login:
   - Usuario: `admin`
   - Contraseña: `admin123` (⚠️ cambiar después)

### 5.3 Panel de Empleado

1. Abre: `http://tu-dominio.donweb.com/empleado`
2. Login con credenciales de empleado

---

## 🔧 Comandos Útiles Post-Despliegue

### Ver logs en tiempo real
```bash
docker-compose logs -f
```

### Ver uso de recursos
```bash
docker stats
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

### Actualizar código
```bash
# Si usas Git
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup de base de datos
```bash
docker-compose exec db pg_dump -U postgres turnero_peluqueria > backup_$(date +%Y%m%d).sql
```

---

## 🆘 Solución de Problemas

### Problema: "Frontend no muestra datos"

**Síntoma:** La página carga pero no se ven servicios/turnos.

**Causa:** El frontend no puede conectarse al backend.

**Solución:**
```bash
# 1. Verificar API_URL
cat .env | grep API_URL

# 2. Debe ser el dominio público, no localhost
# Correcto: API_URL=http://turnero123.donweb.com:8080/api
# Incorrecto: API_URL=http://localhost:8080/api

# 3. Si está mal, editar:
nano .env

# 4. Reconstruir frontend
docker-compose up -d --build frontend
```

### Problema: "502 Bad Gateway"

**Causa:** El backend no está respondiendo.

**Solución:**
```bash
# Ver logs del backend
docker-compose logs backend

# Verificar que esté corriendo
docker-compose ps backend

# Reiniciar
docker-compose restart backend
```

### Problema: "Cannot connect to database"

**Causa:** Backend no puede conectarse a PostgreSQL.

**Solución:**
```bash
# Verificar base de datos
docker-compose ps db
docker-compose logs db

# Reiniciar
docker-compose restart db
docker-compose restart backend
```

### Problema: "Port already in use"

**Causa:** El puerto ya está siendo usado.

**Solución:**
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :80
sudo lsof -i :8080

# Matar el proceso (reemplazar PID)
sudo kill -9 PID

# O cambiar el puerto en .env
```

---

## 📋 Checklist Final

- [ ] Código subido a DonWeb
- [ ] Archivo `.env` configurado con dominio real
- [ ] Docker y Docker Compose instalados
- [ ] `docker-compose up -d` ejecutado exitosamente
- [ ] Todos los contenedores en estado `Up`
- [ ] Frontend accesible en `http://tu-dominio.donweb.com`
- [ ] Backend responde en `http://tu-dominio.donweb.com:8080/actuator/health`
- [ ] API devuelve datos en `/api/servicios`
- [ ] Frontend muestra servicios y permite reservar turnos
- [ ] Contraseñas de producción configuradas
- [ ] Backup inicial de base de datos realizado

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu sistema completo está desplegado:

- ✅ **Frontend:** Los clientes pueden reservar turnos
- ✅ **Backend:** API REST funcionando
- ✅ **Base de datos:** PostgreSQL con datos iniciales
- ✅ **WhatsApp:** Evolution API integrado (opcional)

**URLs importantes:**
- Frontend: `http://tu-dominio.donweb.com`
- Backend API: `http://tu-dominio.donweb.com:8080/api`
- Swagger: `http://tu-dominio.donweb.com:8080/swagger-ui.html`
- Admin: `http://tu-dominio.donweb.com/admin`

---

**¿Necesitas ayuda?** Revisa:
- `CONFIGURACION-DONWEB.md` - Guía detallada
- `COMANDOS-DONWEB.md` - Comandos útiles
- `CHECKLIST-DONWEB.md` - Lista de verificación
