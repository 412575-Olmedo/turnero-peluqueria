# 🔧 Configuración de Variables de Entorno para DonWeb

## Variables Requeridas

Al configurar el hosting de Docker en DonWeb, necesitarás configurar las siguientes variables de entorno:

### 🗄️ Base de Datos PostgreSQL

```env
# Nombre de la base de datos
POSTGRES_DB=turnero_peluqueria

# Usuario de PostgreSQL (cambiar por seguridad)
POSTGRES_USER=turnero_user

# Contraseña de PostgreSQL (CAMBIAR - usar contraseña fuerte)
POSTGRES_PASSWORD=TU_CONTRASEÑA_SEGURA_AQUI
```

**Generador de contraseña segura:**
```bash
openssl rand -base64 32 | tr -d '\n'
```

### 🔧 Backend (Spring Boot)

```env
# Perfil de Spring (dejar en prod)
SPRING_PROFILES_ACTIVE=prod

# URL de conexión a la base de datos
DB_URL=jdbc:postgresql://db:5432/turnero_peluqueria

# Usuario de base de datos (debe coincidir con POSTGRES_USER)
DB_USERNAME=turnero_user

# Contraseña de base de datos (debe coincidir con POSTGRES_PASSWORD)
DB_PASSWORD=TU_CONTRASEÑA_SEGURA_AQUI

# Clave secreta para JWT (CAMBIAR - mínimo 64 caracteres)
JWT_SECRET=GENERAR_CLAVE_ALEATORIA_64_CARACTERES_MINIMO

# Tiempo de expiración del token JWT en milisegundos (24 horas = 86400000)
JWT_EXPIRATION=86400000
```

**Generador de JWT_SECRET:**
```bash
openssl rand -base64 64 | tr -d '\n'
```

### 🌐 Frontend (Angular + Nginx)

```env
# URL de la API backend (ajustar según tu dominio)
API_URL=http://tu-dominio.com:8080/api

# Host de Nginx (tu dominio o _ para cualquiera)
NGINX_HOST=tu-dominio.com
```

### 🔌 Puertos Externos

```env
# Puerto externo de PostgreSQL (DonWeb puede asignar uno diferente)
DB_EXTERNAL_PORT=5432

# Puerto externo del backend (DonWeb puede asignar uno diferente)
BACKEND_EXTERNAL_PORT=8080

# Puerto externo del frontend (usualmente 80 o el que DonWeb asigne)
FRONTEND_EXTERNAL_PORT=80
```

## 📝 Ejemplo de Configuración Completa

```env
# Base de datos
POSTGRES_DB=turnero_peluqueria
POSTGRES_USER=turnero_user
POSTGRES_PASSWORD=K9mP2xQ5vL8nR3wY7zT4hJ6gF1dS9bN5

# Backend
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:postgresql://db:5432/turnero_peluqueria
DB_USERNAME=turnero_user
DB_PASSWORD=K9mP2xQ5vL8nR3wY7zT4hJ6gF1dS9bN5
JWT_SECRET=a8f5e2c9d7b4h6j3k1m9n0p2q5r8t1u4v7w0x3y6z9A2B5C8D1E4F7G0H3I6J9K2L5M8N1O4P7Q0
JWT_EXPIRATION=86400000

# Frontend
API_URL=http://mi-peluqueria.donweb.com:8080/api
NGINX_HOST=mi-peluqueria.donweb.com

# Puertos
DB_EXTERNAL_PORT=5432
BACKEND_EXTERNAL_PORT=8080
FRONTEND_EXTERNAL_PORT=80
```

## 🔒 Mejores Prácticas de Seguridad

### ✅ Hacer

1. **Generar contraseñas únicas y fuertes**
   - Usar generadores de contraseñas
   - Mínimo 32 caracteres para contraseñas
   - Mínimo 64 caracteres para JWT_SECRET

2. **Nunca usar valores por defecto**
   - Cambiar TODAS las contraseñas
   - Generar un JWT_SECRET único

3. **Mantener seguras las credenciales**
   - No commitear el archivo `.env` al repositorio
   - Guardar credenciales en un gestor de contraseñas
   - Limitar acceso a variables de entorno

4. **Rotación de credenciales**
   - Cambiar contraseñas periódicamente
   - Regenerar JWT_SECRET si es necesario

### ❌ No Hacer

1. **NO usar contraseñas simples**
   - ❌ password123
   - ❌ admin
   - ❌ 12345678

2. **NO compartir credenciales**
   - No enviar por email sin cifrar
   - No compartir en mensajería instantánea
   - No almacenar en texto plano

3. **NO commitear al repositorio**
   - El archivo `.env` está en `.gitignore`
   - Verificar antes de cada commit

## 🎯 Configuración en DonWeb

### Método 1: Panel de Control de DonWeb

1. Acceder al panel de Docker Hosting
2. Ir a "Variables de Entorno" o "Environment Variables"
3. Agregar cada variable una por una
4. Guardar y reiniciar contenedores

### Método 2: Archivo .env en el Servidor

1. Conectar por SSH al servidor
2. Navegar al directorio del proyecto
3. Crear archivo `.env`:
   ```bash
   nano .env
   ```
4. Copiar las variables
5. Guardar (Ctrl+O, Enter, Ctrl+X)
6. Asegurar permisos correctos:
   ```bash
   chmod 600 .env
   ```

## 🧪 Verificar Configuración

### Después de configurar las variables:

```bash
# Verificar que las variables están disponibles
docker-compose -f docker-compose.prod.yml config

# Ver variables de un contenedor específico
docker-compose -f docker-compose.prod.yml exec backend env | grep -E "DB_|JWT_|SPRING_"

# Verificar salud del backend
curl http://localhost:8080/actuator/health

# Ver logs para detectar errores de configuración
docker-compose -f docker-compose.prod.yml logs backend | grep -i error
docker-compose -f docker-compose.prod.yml logs frontend | grep -i error
```

## 📞 Soporte DonWeb

Si tienes problemas configurando las variables de entorno:

1. **Documentación oficial de DonWeb**
   - Buscar "Docker Hosting" en su centro de ayuda

2. **Soporte técnico**
   - Contactar al soporte de DonWeb
   - Tener a mano tu número de cliente

3. **Recursos adicionales**
   - Revisar [DEPLOYMENT-DONWEB.md](./DEPLOYMENT-DONWEB.md)
   - Consultar [DOCKER-GUIDE.md](./DOCKER-GUIDE.md)

## 🔍 Solución de Problemas

### Error: Backend no puede conectar a la base de datos

**Síntoma:** Backend muestra errores de conexión

**Solución:**
1. Verificar que `DB_URL`, `DB_USERNAME` y `DB_PASSWORD` coinciden con las de PostgreSQL
2. Verificar que el contenedor de BD está corriendo:
   ```bash
   docker-compose -f docker-compose.prod.yml ps db
   ```

### Error: JWT inválido o expirado

**Síntoma:** Frontend muestra errores de autenticación

**Solución:**
1. Verificar que `JWT_SECRET` tiene al menos 64 caracteres
2. Reiniciar el backend:
   ```bash
   docker-compose -f docker-compose.prod.yml restart backend
   ```

### Error: Frontend no puede conectar al backend

**Síntoma:** Errores de red en la consola del navegador

**Solución:**
1. Verificar que `API_URL` apunta a la URL correcta
2. Si usas un dominio, asegúrate de incluir el protocolo (`http://` o `https://`)
3. Verificar CORS en el backend si el dominio del frontend es diferente

## 📝 Plantilla para Guardar Credenciales

```
========================================
TURNERO PELUQUERÍA - CREDENCIALES
========================================

ENTORNO: Producción DonWeb
FECHA: __________________

--- Base de Datos ---
POSTGRES_DB: turnero_peluqueria
POSTGRES_USER: turnero_user
POSTGRES_PASSWORD: __________________

--- Backend ---
JWT_SECRET: __________________
JWT_EXPIRATION: 86400000

--- URLs ---
DOMINIO: __________________
FRONTEND: http://________________
BACKEND: http://________________:8080
SWAGGER: http://________________:8080/swagger-ui.html

--- Acceso SSH ---
HOST: __________________
USUARIO: __________________
PASSWORD: __________________

========================================
GUARDAR EN LUGAR SEGURO
NO COMPARTIR POR MEDIOS INSEGUROS
========================================
```

---

**Importante:** Guarda este archivo con credenciales en un gestor de contraseñas o lugar seguro. Nunca lo subas al repositorio ni lo compartas por medios inseguros.
