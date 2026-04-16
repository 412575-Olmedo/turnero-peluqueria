# Configuracion WhatsApp (documento legacy)

> Este documento corresponde a la integracion anterior con Twilio y quedo obsoleto.
>
> Para la implementacion actual con Evolution API, usar [EVOLUTION-SETUP.md](EVOLUTION-SETUP.md).

# 📱 Configuración de Recordatorios WhatsApp con Twilio

## 🚀 Implementación Completada

Se ha integrado el sistema de recordatorios automáticos por WhatsApp usando Twilio. Las siguientes funcionalidades están disponibles:

### ✅ Características Implementadas

1. **Servicio de Notificaciones WhatsApp** (`WhatsAppNotificacionService`)
   - Envío de recordatorios de turnos
   - Envío de confirmaciones de turnos creados
   - Envío de notificaciones de cancelación
   - Formateo automático de números telefónicos (Argentina +54)

2. **Scheduler de Recordatorios Automáticos** (`RecordatorioScheduler`)
   - **Recordatorios diarios**: Se ejecutan a las 9:00 AM para turnos del día siguiente
   - **Recordatorios de última hora**: Cada hora de 9 AM a 7 PM para turnos en las próximas 2 horas
   - **Limpieza automática**: A las 2:00 AM marca como NO_ASISTIO los turnos pasados
   - **Reporte diario**: A las 8:00 PM genera estadísticas del día

3. **Endpoints REST para Control Manual**
   - `POST /api/turnos/{id}/enviar-recordatorio` - Enviar recordatorio manual
   - `POST /api/turnos/{id}/enviar-confirmacion` - Enviar confirmación manual
   - `GET /api/turnos/whatsapp/estado` - Ver estado del servicio

---

## 🔧 Configuración Inicial (5 minutos)

### Paso 1: Crear Cuenta en Twilio (GRATIS)

1. Ve a [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Regístrate con tu email
3. Verifica tu número de teléfono
4. Recibirás **USD 15 de crédito gratis** (suficiente para ~2500 mensajes)

### Paso 2: Activar WhatsApp Sandbox

1. En el Dashboard de Twilio, ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Verás un número de Twilio (ej: `+1 415 523 8886`) y un código (ej: `join <palabra>`)
3. **Desde tu WhatsApp personal**, envía ese mensaje al número de Twilio
4. Recibirás confirmación: "You are all set! The Sandbox is ready to send messages to you."

### Paso 3: Obtener Credenciales

En el Dashboard de Twilio:
- **Account SID**: Lo encuentras en la página principal (ej: `ACxxxxxxxxx`)
- **Auth Token**: Click en "Show" para verlo (ej: `xxxxxxxxx`)
- **WhatsApp From Number**: `whatsapp:+14155238886` (el número del sandbox)

### Paso 4: Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto:

```bash
# ===========================================
# TWILIO WHATSAPP (Recordatorios)
# ===========================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx          # ← REEMPLAZAR con tu Account SID
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxx        # ← REEMPLAZAR con tu Auth Token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886       # ← Número del sandbox (NO cambiar)
TWILIO_WHATSAPP_ENABLED=true                     # ← true para habilitar, false para deshabilitar

# Configuración de recordatorios automáticos
RECORDATORIOS_ENABLED=true                       # ← Habilitar tareas programadas
RECORDATORIOS_HORAS_ANTICIPACION=24              # ← Enviar recordatorios 24 horas antes
```

### Paso 5: Reiniciar la Aplicación

```bash
# Detener backend si está corriendo
# En PowerShell:
docker-compose down

# Levantar con nuevas configuraciones
docker-compose up -d
```

---

## 🧪 Probar el Sistema

### Prueba 1: Crear un Turno y Ver Confirmación

1. Crea un turno usando el frontend o Swagger
2. Automáticamente se enviará una confirmación por WhatsApp al cliente
3. El cliente verá:
   ```
   ✅ Turno Confirmado

   Hola Juan Pérez! 👋

   Tu turno ha sido agendado:
   📅 Fecha: 13/02/2026
   ⏰ Hora: 10:00
   💇 Servicio: Corte de Cabello
   👨‍💼 Profesional: Carlos López
   💰 Precio: $5000.00

   📝 Código de cancelación: ABC123
   ⚠️ Guarda este código para cancelar si es necesario.

   Te enviaremos un recordatorio antes de tu cita.
   ¡Nos vemos pronto! 😊
   ```

### Prueba 2: Enviar Recordatorio Manual

Usando Swagger (`http://localhost:8080/swagger-ui.html`):

1. Ve a **Turnos** → `POST /api/turnos/{id}/enviar-recordatorio`
2. Ingresa el ID de un turno
3. El cliente recibirá el recordatorio inmediatamente

### Prueba 3: Ver Estado del Servicio

```bash
# En PowerShell:
curl http://localhost:8080/api/turnos/whatsapp/estado
```

Respuesta esperada:
```json
{
  "habilitado": true,
  "servicio": "Twilio WhatsApp",
  "mensaje": "Servicio de notificaciones WhatsApp activo"
}
```

---

## ⏰ Tareas Programadas (Cron Jobs)

| Tarea | Horario | Descripción |
|-------|---------|-------------|
| **Recordatorios Diarios** | 9:00 AM | Envía recordatorios para turnos del día siguiente |
| **Recordatorios de Última Hora** | 9 AM - 7 PM (cada hora) | Recordatorios para turnos en las próximas 2 horas |
| **Limpieza de Turnos** | 2:00 AM | Marca como NO_ASISTIO los turnos pasados no finalizados |
| **Reporte Diario** | 8:00 PM | Genera estadísticas del día en los logs |

### Modificar Horarios

Edita `RecordatorioScheduler.java` y cambia las expresiones cron:

```java
// Ejemplo: Enviar recordatorios a las 10 AM en lugar de 9 AM
@Scheduled(cron = "0 0 10 * * *")  // ← Cambia aquí
public void enviarRecordatoriosDiarios() {
```

**Formato Cron**: `segundos minutos horas día mes día-semana`

---

## 💰 Costos y Límites

### Sandbox (GRATIS - Para Testing)

- ✅ **Costo**: $0 (completamente gratis)
- ✅ **Límite**: Sin límite de mensajes con tu crédito inicial
- ⚠️ **Limitación**: Solo puedes enviar a números que se unieron al sandbox
- ⚠️ **Mensajes**: Incluyen prefijo "using Twilio Sandbox for WhatsApp"

**Cómo agregar más destinatarios al Sandbox:**
1. Cada cliente debe enviar `join <código>` al número de Twilio
2. Una vez unidos, pueden recibir mensajes automáticamente

### Producción (Twilio WhatsApp Business)

Para usar en producción (enviar a cualquier número):

| Región | Costo por Mensaje | 1,000 Mensajes/Mes |
|--------|-------------------|---------------------|
| **Argentina** | USD 0.005 - 0.009 | ~USD 5 - 9 |
| **WhatsApp Número** | USD 1 - 2/mes | Costo fijo |
| **Total ~30 turnos/día** | - | USD 6 - 11/mes |

**Para activar producción:**
1. Verificar negocio en Twilio
2. Comprar/registrar número de WhatsApp Business
3. Aprobar plantillas de mensajes (24-48 hs)

---

## 🔧 Configuraciones Avanzadas

### Deshabilitar Notificaciones Temporalmente

```bash
# En .env:
TWILIO_WHATSAPP_ENABLED=false

# O solo deshabilitar tareas automáticas:
RECORDATORIOS_ENABLED=false
```

### Cambiar Horas de Anticipación

```bash
# En .env:
# Enviar recordatorios 48 horas antes en lugar de 24:
RECORDATORIOS_HORAS_ANTICIPACION=48
```

### Personalizar Mensajes

Edita `WhatsAppNotificacionService.java`:

```java
private String construirMensajeRecordatorio(Turno turno) {
    return String.format(
        "🔔 *Recordatorio de Turno*\n\n" +
        "Hola %s! 👋\n\n" +
        // ↓ Personaliza tu mensaje aquí
        "Tu mensaje personalizado...",
        turno.getClienteNombre()
    );
}
```

### Formato de Números Telefónicos

El servicio acepta números en varios formatos:
- `1112345678` → Se convierte a `whatsapp:+5491112345678`
- `5491112345678` → Se convierte a `whatsapp:+5491112345678`
- `+5491112345678` → Se convierte a `whatsapp:+5491112345678`

Para cambiar el código de país por defecto, edita `formatearNumeroWhatsApp()` en `WhatsAppNotificacionService.java`.

---

## 🐛 Solución de Problemas

### Error: "Unable to create record: Permission to send an SMS has not been enabled"

**Causa**: No activaste el WhatsApp Sandbox  
**Solución**: Envía `join <código>` al número de Twilio desde tu WhatsApp

### Error: "Twilio could not find a Channel with the specified From address"

**Causa**: El número "From" no es válido  
**Solución**: Asegúrate de usar `whatsapp:+14155238886` (con el prefijo `whatsapp:`)

### No se envían recordatorios automáticos

**Verificar**:
1. ¿La aplicación está corriendo? (`docker ps`)
2. ¿RECORDATORIOS_ENABLED=true en .env?
3. ¿Hay turnos para mañana?
4. Revisa los logs: `docker logs turnero-backend-1`

### Mensaje no llega al cliente

**Verificar**:
1. ¿El cliente se unió al sandbox?
2. ¿El número tiene formato correcto? (+549... para Argentina)
3. Revisa logs del backend para ver errores de Twilio

---

## 📊 Monitoreo

### Ver Logs de Envío

```bash
# PowerShell:
docker logs -f turnero-backend-1 | Select-String "WhatsApp"
```

Verás:
```
✅ Recordatorio WhatsApp enviado - Turno #123 - SID: SMxxxxxxxxx - Cliente: Juan Pérez
❌ Error al enviar recordatorio WhatsApp - Turno #456: Invalid phone number
```

### Dashboard de Twilio

Ve a [https://console.twilio.com](https://console.twilio.com) → **Monitor** → **Logs** → **WhatsApp**

Aquí puedes ver:
- Cantidad de mensajes enviados
- Estado de cada mensaje (Delivered, Failed, etc.)
- Errores detallados

---

## 🚀 Próximos Pasos

### Migrar a Producción

1. **Verificar Negocio en Twilio**:
   - Subir documentos (DNI, comprobante fiscal)
   - Esperar aprobación (2-5 días)

2. **Comprar Número de WhatsApp**:
   - En Twilio: Buy a Number → WhatsApp
   - Configurar webhook

3. **Crear Plantillas de Mensajes**:
   - Twilio requiere pre-aprobar mensajes para producción
   - Proceso: 24-48 horas

4. **Actualizar .env**:
   ```bash
   TWILIO_WHATSAPP_FROM=whatsapp:+5491112345678  # Tu número comprado
   ```

### Agregar Más Funcionalidades

- ✉️ **Respuestas automáticas**: Cliente responde y cancela turno
- 📸 **Enviar comprobante por WhatsApp**: QR code en la confirmación
- 🔔 **Notificación al empleado**: Cuando se crea/cancela turno
- 📊 **Encuestas post-servicio**: "¿Cómo fue tu experiencia?"

---

## 📞 Soporte

- **Documentación Twilio**: [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- **API Reference**: [https://www.twilio.com/docs/sms/api](https://www.twilio.com/docs/sms/api)
- **Código de ejemplo**: Ver `WhatsAppNotificacionService.java` y `RecordatorioScheduler.java`

---

## ✅ Checklist de Implementación

- [x] Dependencia de Twilio agregada al pom.xml
- [x] Servicio de notificaciones WhatsApp creado
- [x] Scheduler de recordatorios automáticos configurado
- [x] Variables de entorno documentadas
- [x] Endpoints REST para control manual
- [x] DTO de respuesta de notificaciones
- [x] Integración con TurnoService
- [ ] Configurar credenciales de Twilio en .env
- [ ] Probar envío de mensajes
- [ ] (Opcional) Configurar plantillas personalizadas
- [ ] (Opcional) Migrar a producción

¡Listo para enviar recordatorios por WhatsApp! 🎉
