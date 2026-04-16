# 🎯 INICIO RÁPIDO - Despliegue en DonWeb

## ⚡ Para Desplegar en DonWeb (3 Pasos)

### 1️⃣ Configurar Variables (2 minutos)

```bash
# Editar archivo .env con tus datos:
# - POSTGRES_PASSWORD (tu contraseña segura)
# - JWT_SECRET (64 caracteres aleatorios)
# - API_URL (tu dominio de DonWeb)
```

### 2️⃣ Conectar al VPS y Subir Código

```bash
# Por SSH
ssh usuario@tu-dominio.donweb.com

# Subir el código (Git, FTP, o panel de DonWeb)
git clone https://github.com/tu-usuario/turnero-peluqueria.git
cd turnero-peluqueria
```

### 3️⃣ Desplegar

```bash
# Linux/Mac
./deploy-donweb.sh

# Windows en el VPS
.\deploy-donweb.ps1

# Manual
docker-compose up -d --build
```

**¡Listo! 🎉** Tu sistema está en: `http://tu-dominio.donweb.com`

---

## 📚 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| **[CONFIGURACION-DONWEB.md](CONFIGURACION-DONWEB.md)** | 📖 Guía completa paso a paso |
| **[CHECKLIST-DONWEB.md](CHECKLIST-DONWEB.md)** | ✅ Checklist de despliegue |
| **[COMANDOS-DONWEB.md](COMANDOS-DONWEB.md)** | 💻 Comandos esenciales |

---

## 🧪 Probar Localmente Primero

Antes de desplegar a DonWeb, prueba localmente:

### Windows
```cmd
test-local.bat
```

### Linux/Mac
```bash
docker-compose up -d
```

Luego abre: `http://localhost`

---

## 🌐 URLs del Sistema

Una vez desplegado, accede a:

- **👥 Clientes (Página principal):** `http://tu-dominio.donweb.com`
- **👨‍💼 Panel Admin:** `http://tu-dominio.donweb.com/admin`
- **👨‍🔧 Panel Empleado:** `http://tu-dominio.donweb.com/empleado`
- **📚 API Docs (Swagger):** `http://tu-dominio.donweb.com:8080/swagger-ui.html`

---

## ⚙️ Arquitectura

```
Internet
   ↓
DonWeb VPS
   ├── Frontend (Angular) → Puerto 80
   ├── Backend (Spring Boot) → Puerto 8080
   ├── PostgreSQL → Puerto 5432 (interno)
   └── Evolution API (WhatsApp) → Puerto 8085
```

---

## 🔑 Credenciales por Defecto

⚠️ **CAMBIAR EN PRODUCCIÓN**

- **Admin:** `admin` / `admin123`
- **Base de datos:** Ver `.env`

---

## 📝 Comandos Rápidos

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Reiniciar backend
docker-compose restart backend

# Detener todo
docker-compose down

# Backup de BD
docker-compose exec db pg_dump -U postgres turnero_peluqueria > backup.sql
```

Ver más en [COMANDOS-DONWEB.md](COMANDOS-DONWEB.md)

---

## 🆘 Problemas Comunes

### Frontend no muestra datos
```bash
# Verificar API_URL en .env
cat .env | grep API_URL

# Debe ser: http://tu-dominio.donweb.com:8080/api
```

### Backend no inicia
```bash
# Ver logs
docker-compose logs backend

# Verificar variables de entorno
docker-compose exec backend env
```

### Error de conexión a BD
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps db

# Ver logs
docker-compose logs db
```

Ver más en [CONFIGURACION-DONWEB.md](CONFIGURACION-DONWEB.md) sección "Solución de Problemas"

---

## 📦 ¿Qué incluye este proyecto?

- ✅ Backend Spring Boot 3 + Java 17
- ✅ Frontend Angular 19 (standalone components)
- ✅ Base de datos PostgreSQL 16
- ✅ Integración WhatsApp (Evolution API)
- ✅ Docker + Docker Compose
- ✅ Documentación completa
- ✅ Scripts de despliegue automatizados

---

## 🎯 Siguiente Paso

1. **Primera vez:** Lee [CONFIGURACION-DONWEB.md](CONFIGURACION-DONWEB.md)
2. **Ya leíste la guía:** Sigue [CHECKLIST-DONWEB.md](CHECKLIST-DONWEB.md)
3. **Ya está desplegado:** Usa [COMANDOS-DONWEB.md](COMANDOS-DONWEB.md)

---

## 🔒 Seguridad

Antes de producción:
- [ ] Cambiar `POSTGRES_PASSWORD`
- [ ] Generar nuevo `JWT_SECRET`
- [ ] Cambiar contraseña de admin
- [ ] Configurar firewall
- [ ] Hacer backup inicial

---

## 📞 Soporte

- **Documentación:** Ver archivos `.md` en la raíz
- **Soporte DonWeb:** [Panel de DonWeb](https://donweb.com)
- **Issues del proyecto:** [Si usas GitHub]

---

**Última actualización:** 2024  
**Versión:** 1.0.0
