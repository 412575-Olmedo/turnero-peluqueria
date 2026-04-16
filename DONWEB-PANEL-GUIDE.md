# 🎛️ Configuración en el Panel de DonWeb

Esta guía te ayudará a configurar el proyecto directamente desde el panel de administración de DonWeb.

## 📋 Información que Necesitarás

Antes de comenzar, ten a mano:
- Tu dominio o subdominio
- Acceso SSH (usuario y contraseña/clave)
- Contraseñas seguras generadas

## 🔧 Pasos en el Panel de DonWeb

### 1. Acceder al Hosting de Docker

1. Ingresar al panel de control de DonWeb
2. Ir a **"Servicios"** → **"Docker Hosting"**
3. Seleccionar tu servicio de Docker

### 2. Configurar el Repositorio (Opción A)

Si DonWeb permite conectar con un repositorio Git:

1. Ir a **"Despliegue"** o **"Deploy"**
2. Conectar con tu repositorio (GitHub, GitLab, Bitbucket)
3. Seleccionar la rama `main` o `master`
4. Especificar archivo de Docker Compose: `docker-compose.prod.yml`

### 2. Subir Archivos Manualmente (Opción B)

Si prefieres subir archivos vía SFTP/SSH:

1. Conectar por SFTP usando:
   - Host: `tu-servidor.donweb.com`
   - Usuario: `tu_usuario`
   - Puerto: `22` (SSH/SFTP)

2. Subir estos archivos esenciales:
   ```
   /turnero-peluqueria/
   ├── docker-compose.prod.yml
   ├── .env (configurado con tus valores)
   ├── init-db.sql
   ├── front/
   │   ├── Dockerfile
   │   ├── nginx.conf
   │   ├── docker-entrypoint.sh
   │   └── [todo el código del frontend]
   └── initial-scaffolding/
       ├── Dockerfile
       ├── pom.xml
       └── src/
           └── [todo el código del backend]
   ```

### 3. Configurar Variables de Entorno

En el panel de DonWeb:

1. Ir a **"Variables de Entorno"** o **"Environment Variables"**
2. Agregar las siguientes variables:

#### Base de Datos
```
POSTGRES_DB=turnero_peluqueria
POSTGRES_USER=turnero_user
POSTGRES_PASSWORD=[TU_CONTRASEÑA_SEGURA]
```

#### Backend
```
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:postgresql://db:5432/turnero_peluqueria
DB_USERNAME=turnero_user
DB_PASSWORD=[MISMA_CONTRASEÑA_DE_ARRIBA]
JWT_SECRET=[CLAVE_DE_64_CARACTERES]
JWT_EXPIRATION=86400000
```

#### Frontend
```
API_URL=http://[TU_DOMINIO]:8080/api
NGINX_HOST=[TU_DOMINIO]
```

#### Puertos (ajustar según DonWeb)
```
DB_EXTERNAL_PORT=5432
BACKEND_EXTERNAL_PORT=8080
FRONTEND_EXTERNAL_PORT=80
```

### 4. Configurar Puertos Expuestos

En el panel de DonWeb, configurar los puertos:

| Servicio | Puerto Interno | Puerto Externo | Protocolo |
|----------|----------------|----------------|-----------|
| Frontend | 80 | 80 (o el que DonWeb asigne) | HTTP |
| Backend | 8080 | 8080 (o el que DonWeb asigne) | HTTP |
| Database | 5432 | No exponer públicamente | TCP |

**Importante:** La base de datos NO debe ser accesible desde internet, solo internamente entre contenedores.

### 5. Configurar Volúmenes Persistentes

Si DonWeb permite configurar volúmenes:

1. Crear volumen para la base de datos:
   - Nombre: `postgres_data`
   - Ruta en contenedor: `/var/lib/postgresql/data`
   - Tipo: Volumen persistente

Esto garantiza que los datos no se pierdan al reiniciar contenedores.

### 6. Configurar Red

Si DonWeb permite configurar redes:

1. Crear red bridge: `turnero-network`
2. Conectar los 3 servicios a esta red:
   - `turnero-frontend-prod`
   - `turnero-backend-prod`
   - `turnero-db-prod`

### 7. Iniciar los Servicios

1. Ir a **"Servicios"** o **"Containers"**
2. Iniciar en este orden:
   - ✅ Base de datos (`db`)
   - ✅ Backend (`backend`)
   - ✅ Frontend (`frontend`)

3. Esperar a que cada servicio esté "Running" y "Healthy"

### 8. Verificar Logs

1. Ir a **"Logs"** en el panel
2. Revisar logs de cada servicio:
   - **DB**: Debe mostrar "database system is ready to accept connections"
   - **Backend**: Debe mostrar "Started Application in X seconds"
   - **Frontend**: Debe mostrar "nginx started"

3. No debe haber errores en rojo

## 🌐 Configurar Dominio

### Opción A: Dominio Principal

1. Ir a **"Dominios"** en DonWeb
2. Apuntar tu dominio al servidor Docker:
   - Tipo: `A`
   - Host: `@` (dominio principal)
   - Valor: IP del servidor
   - TTL: 3600

3. Esperar propagación DNS (puede tardar hasta 48h, usualmente < 1h)

### Opción B: Subdominio

1. Crear subdominio:
   - Tipo: `A`
   - Host: `turnero` (para turnero.tudominio.com)
   - Valor: IP del servidor
   - TTL: 3600

2. Actualizar `API_URL` en variables de entorno:
   ```
   API_URL=http://turnero.tudominio.com:8080/api
   ```

## 🔒 Configurar SSL/HTTPS (Opcional pero Recomendado)

### Si DonWeb proporciona Let's Encrypt automático:

1. Ir a **"SSL/TLS"**
2. Activar Let's Encrypt
3. Seleccionar tu dominio
4. Esperar emisión del certificado (2-5 minutos)

### Si necesitas configurar SSL manualmente:

Actualizar `nginx.conf` para incluir SSL:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    # ... resto de configuración
}
```

Actualizar `API_URL`:
```
API_URL=https://tudominio.com/api
```

## 📊 Monitoreo en DonWeb

### Dashboard de Contenedores

1. Ir a **"Dashboard"** o **"Monitoring"**
2. Verificar:
   - ✅ CPU Usage < 80%
   - ✅ Memory Usage < 80%
   - ✅ Disk Space suficiente
   - ✅ Containers Status: Running

### Configurar Alertas

Si DonWeb permite:

1. Ir a **"Alertas"** o **"Notifications"**
2. Configurar alertas para:
   - Contenedor detenido
   - CPU > 90%
   - Memoria > 90%
   - Disco > 85%

## 🔄 Actualizar la Aplicación desde el Panel

### Método 1: Con Git (si está conectado)

1. Ir a **"Despliegue"**
2. Click en **"Redesplegar"** o **"Redeploy"**
3. Esperar a que se descarguen cambios y reconstruyan contenedores

### Método 2: Manual

1. Conectar por SSH:
   ```bash
   ssh usuario@tu-servidor.donweb.com
   ```

2. Navegar al proyecto:
   ```bash
   cd /ruta/proyecto/turnero-peluqueria
   ```

3. Actualizar y redesplegar:
   ```bash
   git pull origin main
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml build --no-cache
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🗄️ Backups desde el Panel

### Configurar Backups Automáticos

1. Ir a **"Backups"** en DonWeb
2. Configurar backup del volumen `postgres_data`:
   - Frecuencia: Diaria
   - Hora: 2:00 AM
   - Retención: 7 días

### Backup Manual

1. Ir a **"Backups"**
2. Seleccionar volumen `postgres_data`
3. Click en **"Crear Backup"**
4. Esperar confirmación

### Restaurar Backup

1. Ir a **"Backups"**
2. Seleccionar backup a restaurar
3. Click en **"Restaurar"**
4. **ADVERTENCIA:** Esto sobrescribirá datos actuales

## 🆘 Solución de Problemas en el Panel

### Contenedor no inicia

1. Ir a **"Logs"** → Revisar errores
2. Verificar **"Variables de Entorno"** estén correctas
3. Verificar **"Volúmenes"** estén montados
4. Reiniciar contenedor: **"Servicios"** → **"Restart"**

### Error de conexión entre contenedores

1. Verificar que todos estén en la misma red
2. Ir a **"Redes"** → Verificar `turnero-network`
3. Revisar nombres de contenedores en `docker-compose.prod.yml`

### Base de datos vacía después de reinicio

1. Verificar que el volumen `postgres_data` esté persistente
2. Ir a **"Volúmenes"** → Verificar configuración
3. Si se perdió, restaurar desde backup

## 📞 Contactar Soporte de DonWeb

Si necesitas ayuda del soporte técnico:

1. Ir a **"Soporte"** en el panel
2. Crear ticket con:
   - Descripción del problema
   - Logs relevantes (copiar desde el panel)
   - Pasos para reproducir
   - Screenshots si es posible

3. Información útil para el soporte:
   - ID de tu servicio Docker
   - Nombres de contenedores
   - Variables de entorno (SIN contraseñas)
   - Logs de error específicos

## ✅ Checklist de Configuración en Panel

- [ ] Servicio de Docker Hosting activado
- [ ] Repositorio conectado o archivos subidos
- [ ] Variables de entorno configuradas
- [ ] Puertos expuestos correctamente
- [ ] Volumen persistente creado
- [ ] Red configurada (si aplica)
- [ ] Servicios iniciados
- [ ] Logs sin errores
- [ ] Dominio configurado
- [ ] DNS propagado
- [ ] SSL configurado (opcional)
- [ ] Backups automáticos configurados
- [ ] Alertas configuradas (opcional)
- [ ] Aplicación accesible desde internet

## 🎯 URLs de Verificación

Después de configurar todo:

- **Frontend**: `http://tudominio.com` → Debe cargar la página de login
- **Backend Health**: `http://tudominio.com:8080/actuator/health` → Debe devolver `{"status":"UP"}`
- **Swagger**: `http://tudominio.com:8080/swagger-ui.html` → Debe cargar la documentación

---

**¡Listo!** Tu aplicación está configurada y corriendo en DonWeb.

Para cualquier problema, consulta [DEPLOYMENT-DONWEB.md](./DEPLOYMENT-DONWEB.md) o contacta al soporte.
