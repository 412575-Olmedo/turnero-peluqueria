# ✅ Checklist de Despliegue en DonWeb

## 📋 Pre-Despliegue

### 1. Configuración Local

- [ ] Archivo `.env` creado y configurado
- [ ] `POSTGRES_PASSWORD` configurada (segura, mínimo 16 caracteres)
- [ ] `JWT_SECRET` generado (mínimo 64 caracteres aleatorios)
- [ ] `EVOLUTION_API_KEY` configurada (si usas WhatsApp)
- [ ] `API_URL` apunta a tu dominio/IP de DonWeb
- [ ] Probado localmente con `test-local.bat` o `docker-compose up`

### 2. Datos de DonWeb

- [ ] VPS de Docker contratado
- [ ] Plan seleccionado (Plan 2 recomendado: 4GB RAM, 2 vCPUs)
- [ ] Dominio o IP asignada: `____________________`
- [ ] Acceso SSH configurado
- [ ] Usuario SSH: `____________________`

### 3. Código Preparado

- [ ] Todo el código está en la carpeta `turnero-peluqueria`
- [ ] Archivo `.env` en la raíz del proyecto
- [ ] Archivo `docker-compose.yml` presente
- [ ] Archivo `docker-compose.prod.yml` presente (opcional)
- [ ] Carpetas `initial-scaffolding` (backend) y `front` (frontend) presentes

---

## 🚀 Durante el Despliegue

### 4. Subir Código al VPS

**Opción elegida:**
- [ ] Git Clone desde repositorio
- [ ] Subida FTP/SFTP con FileZilla/WinSCP
- [ ] Subida manual desde panel de DonWeb

### 5. Conectar por SSH

```bash
ssh usuario@tu-dominio.donweb.com
# O
ssh usuario@IP_DEL_VPS
```

- [ ] Conexión SSH exitosa
- [ ] Navegado al directorio del proyecto: `cd turnero-peluqueria`

### 6. Verificar Docker

```bash
docker --version
docker-compose --version
```

- [ ] Docker instalado y funcionando
- [ ] Docker Compose instalado

### 7. Ejecutar Despliegue

```bash
# Dar permisos (Linux)
chmod +x deploy-donweb.sh

# Ejecutar
./deploy-donweb.sh
# O
docker-compose up -d --build
```

- [ ] Construcción de imágenes exitosa (puede tomar 5-10 minutos)
- [ ] Contenedores iniciados sin errores

### 8. Verificar Estado

```bash
docker-compose ps
```

- [ ] `turnero-db` en estado `Up` (healthy)
- [ ] `turnero-backend` en estado `Up` (healthy)
- [ ] `turnero-frontend` en estado `Up`
- [ ] `turnero-evolution` en estado `Up` (si usas WhatsApp)

---

## ✅ Post-Despliegue

### 9. Pruebas de Conectividad

- [ ] Frontend accesible: `http://tu-dominio.donweb.com`
- [ ] Backend API responde: `http://tu-dominio.donweb.com:8080/actuator/health`
- [ ] Swagger accesible: `http://tu-dominio.donweb.com:8080/swagger-ui.html`
- [ ] Endpoint de servicios: `http://tu-dominio.donweb.com:8080/api/servicios`

### 10. Pruebas Funcionales

- [ ] Frontend carga correctamente (sin error 502 o 404)
- [ ] Se pueden ver los servicios disponibles
- [ ] Se puede seleccionar una sucursal
- [ ] Se puede reservar un turno
- [ ] Login de administrador funciona: `/admin`
- [ ] Login de empleado funciona: `/empleado`

### 11. Revisar Logs

```bash
docker-compose logs -f
```

- [ ] No hay errores críticos en logs del backend
- [ ] No hay errores críticos en logs del frontend
- [ ] Base de datos conectada correctamente
- [ ] Sin errores de conexión entre servicios

---

## 🔒 Seguridad

### 12. Configuración de Seguridad

- [ ] Contraseñas de producción configuradas (no usar las de ejemplo)
- [ ] JWT_SECRET único y seguro (mínimo 64 caracteres)
- [ ] Puerto 5432 (PostgreSQL) NO expuesto públicamente
- [ ] Firewall configurado:
  - ✅ Puerto 80 (HTTP) - Abierto
  - ✅ Puerto 8080 (Backend API) - Abierto
  - ✅ Puerto 22 (SSH) - Abierto
  - ❌ Puerto 5432 (PostgreSQL) - Cerrado
- [ ] Cambiar contraseña de usuario `admin` por defecto

### 13. Backups

- [ ] Configurar backup automático de base de datos
- [ ] Probar restauración de backup
- [ ] Documentar procedimiento de backup

---

## 📊 Monitoreo

### 14. Configurar Monitoreo

- [ ] Health checks configurados
- [ ] Configurar alertas (opcional)
- [ ] Revisar uso de recursos: `docker stats`

### 15. Documentación

- [ ] Anotar URLs de producción
- [ ] Documentar credenciales (en lugar seguro)
- [ ] Guardar configuración de `.env` en lugar seguro

---

## 🎉 Finalización

### 16. Entrega

- [ ] Sistema funcionando en producción
- [ ] Cliente puede acceder y reservar turnos
- [ ] Administrador puede gestionar el sistema
- [ ] Documentación entregada
- [ ] Capacitación realizada (si aplica)

---

## 📝 Información de Producción

**Completar después del despliegue:**

```
Fecha de despliegue: _______________
Dominio/IP: ________________________
Puerto Frontend: ___________________
Puerto Backend: ____________________
Puerto PostgreSQL: _________________
Usuario admin: _____________________
Contraseña admin: __________________ (guardar en lugar seguro)

Servicios activos:
□ Frontend (Angular)
□ Backend (Spring Boot)
□ Base de datos (PostgreSQL)
□ WhatsApp (Evolution API)

URLs importantes:
- Frontend: _______________________
- Backend API: ____________________
- Swagger: ________________________
- Health: _________________________
```

---

## 🆘 En Caso de Problemas

Si algo no funciona, revisa:

1. **Logs detallados:**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs db
   ```

2. **Estado de contenedores:**
   ```bash
   docker-compose ps
   docker stats
   ```

3. **Variables de entorno:**
   ```bash
   cat .env
   ```

4. **Conectividad interna:**
   ```bash
   docker-compose exec backend sh
   ping db
   ping frontend
   ```

5. **Guía de solución de problemas:**
   Ver `CONFIGURACION-DONWEB.md` sección "Solución de Problemas"

---

## 📞 Contacto de Soporte

- **Soporte DonWeb:** [Datos de contacto]
- **Desarrollador:** [Tu contacto]
- **Documentación:** Ver carpeta raíz del proyecto

---

✅ **Checklist completado:** ______ / ______ items
