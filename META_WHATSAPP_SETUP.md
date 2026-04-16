# Configuración de Meta WhatsApp Cloud API

## ✅ Configuración Completada

Has configurado exitosamente la integración de **Meta WhatsApp Cloud API (oficial)** en tu sistema de turnos.

---

## 📋 Credenciales Obtenidas

Tienes las siguientes credenciales de tu app de Meta:

- **Phone Number ID:** `1050309724835376`
- **WABA ID:** `3133998293473019`
- **Access Token:** Comienza con `EAAAZAD7...` (token temporal)

---

## 🔧 Configuración Local (tu PC)

### 1. Editar el archivo `.env` local

Abre el archivo `.env` en la raíz del proyecto y agrega estas líneas (o actualiza si ya existen):

```env
# Meta WhatsApp Cloud API
META_WHATSAPP_ENABLED=true
META_PHONE_NUMBER_ID=1050309724835376
META_ACCESS_TOKEN=EAAZAxxxxxxxxxxxxxx  # <-- PEGA TU TOKEN COMPLETO AQUÍ
META_API_VERSION=v18.0
META_COUNTRY_CODE=54
META_TIMEOUT_MS=10000
```

**⚠️ IMPORTANTE:** Reemplaza `EAAZAxxxxxxxxxxxxxx` con tu token completo que obtuviste en Meta Developer Console.

### 2. Verificar que el backend compile

Ejecuta desde la carpeta `initial-scaffolding`:

```powershell
mvnw clean package -DskipTests
```

### 3. Levantar el sistema localmente

```powershell
docker compose up -d --build
```

### 4. Probar enviando un mensaje

Una vez que el backend esté corriendo, crea un turno desde el frontend o con curl:

```bash
curl -X POST http://localhost:8080/api/turnos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -d '{
    "empleadoId": 1,
    "servicioId": 1,
    "fechaHoraInicio": "2026-04-15T10:00:00",
    "clienteNombre": "Test Cliente",
    "clienteTelefono": "1112345678",
    "clienteEmail": "test@test.com"
  }'
```

Deberías recibir un WhatsApp de confirmación en el número registrado (tu nuevo chip).

---

## 🚀 Configuración en el VPS (DonWeb)

Una vez que funciona en local, despliega en el VPS:

### 1. Conectarse por SSH al VPS

```bash
ssh root@tu-ip-donweb
```

### 2. Ir al directorio del proyecto

```bash
cd /opt/turnero-app/turnero-peluqueria
```

### 3. Editar el archivo `.env` del VPS

```bash
nano .env
```

Reemplaza las líneas de Evolution con las de Meta:

```env
# Meta WhatsApp Cloud API
META_WHATSAPP_ENABLED=true
META_PHONE_NUMBER_ID=1050309724835376
META_ACCESS_TOKEN=EAAZAxxxxxxxxxxxxxx  # TU TOKEN COMPLETO
META_API_VERSION=v18.0
META_COUNTRY_CODE=54
META_TIMEOUT_MS=10000
```

Guarda con `Ctrl+O`, `Enter`, `Ctrl+X`.

### 4. Rebuild del backend en el VPS

```bash
docker compose build --no-cache backend
```

### 5. Reiniciar los servicios

```bash
docker compose up -d --force-recreate backend
```

### 6. Verificar logs

```bash
docker compose logs -f backend | grep -i "meta\|whatsapp"
```

Deberías ver algo como:

```
✅ Meta WhatsApp Cloud API inicializada - Phone Number ID: 10503097...
```

---

## 📱 Cómo obtener un Token Permanente

El token que tienes actualmente **expira en 24-90 días**. Para obtener un token permanente:

### Opción 1: System User Token (recomendado para producción)

1. Ve a **Meta Business Suite** → https://business.facebook.com
2. En el menú, ve a **Configuración** → **Usuarios del sistema**
3. Crea un **System User** (ej: "turnero-bot")
4. Asigna permisos de WhatsApp a ese usuario
5. Genera un token con permisos: `whatsapp_business_messaging`, `whatsapp_business_management`
6. Ese token **no expira** (a menos que lo revokes manualmente)

### Opción 2: Usar Meta App Secret para renovar

Puedes programar renovación automática usando el `app_id` y `app_secret`, pero es más complejo.

---

## 🧪 Pruebas

### Números de Prueba vs Producción

- **Número de prueba de Meta:** `1050309724835376` → Solo puedes enviar a hasta 5 números que agregues manualmente en el panel de Meta
- **Tu chip nuevo:** Lo debes registrar como "Número de Producción" en Meta Business cuando estés listo

### Para usar tu chip en producción:

1. Ve a **WhatsApp Manager** en Meta Business Suite
2. Selecciona tu app **Corte Estilistas**
3. Click en **Agregar número de teléfono**
4. Verifica tu chip nuevo con el código SMS que Meta te enviará
5. Una vez verificado, reemplaza `META_PHONE_NUMBER_ID` con el nuevo Phone Number ID

---

## 📝 Archivos Modificados

Los siguientes archivos fueron actualizados para usar Meta Cloud API:

### Backend Java

✅ **Nuevo servicio creado:**
- `src/main/java/ar/edu/utn/frc/tup/lc/ii/services/MetaWhatsAppService.java`

✅ **Servicios actualizados:**
- `src/main/java/ar/edu/utn/frc/tup/lc/ii/services/impl/TurnoServiceImpl.java`
  - Ahora usa `MetaWhatsAppService` en lugar de `WhatsAppNotificacionService`

### Configuración

✅ **Properties actualizados:**
- `src/main/resources/application.properties`
- `src/main/resources/application-prod.properties`

✅ **Variables de entorno:**
- `.env.example` → plantilla actualizada con variables de Meta

---

## 🔍 Solución de Problemas

### El backend no arranca

```bash
docker compose logs backend
```

Busca errores relacionados con `META_ACCESS_TOKEN` o `META_PHONE_NUMBER_ID`.

### No se envía WhatsApp

Verifica:

1. ✅ Que `META_WHATSAPP_ENABLED=true`
2. ✅ Que el token es válido (pruébalo en Meta Graph API Explorer)
3. ✅ Que el número de destino está en formato correcto: `5491112345678`
4. ✅ Que el número de destino está autorizado (si usas número de prueba)

### Error "Invalid OAuth access token"

Tu token expiró o es inválido. Genera uno nuevo desde Meta Developer Console.

### Error "Unsupported post request"

Revisa que el `META_PHONE_NUMBER_ID` sea correcto y que tengas permisos en esa cuenta de WhatsApp Business.

---

## 📚 Documentación Oficial

- **Meta WhatsApp Cloud API:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Graph API Explorer:** https://developers.facebook.com/tools/explorer/
- **Business Manager:** https://business.facebook.com

---

## 🎯 Próximos Pasos

1. ✅ Probar localmente con número de prueba
2. ✅ Verificar logs y mensajes recibidos
3. ✅ Desplegar en VPS
4. ⏳ Registrar tu chip como número de producción
5. ⏳ Obtener token permanente (System User Token)
6. ⏳ Configurar webhook para recibir respuestas de clientes (opcional)

---

**¿Problemas?** Revisa los logs con:

```bash
docker compose logs -f backend | grep -E "Meta|WhatsApp|✅|❌"
```

¡Listo! 🎉
