# WhatsApp Recordatorios con Evolution API

## Estado

La integracion de backend fue migrada de Twilio a Evolution API.

## Variables de entorno

Configura estas variables en `.env` (o en tu entorno de despliegue):

```bash
EVOLUTION_WHATSAPP_ENABLED=true
EVOLUTION_API_BASE_URL=http://evolution:8080
EVOLUTION_INSTANCE=turnero
EVOLUTION_API_KEY=TU_API_KEY
EVOLUTION_SEND_TEXT_PATH=/message/sendText/%s
EVOLUTION_TIMEOUT_MS=10000
EVOLUTION_COUNTRY_CODE=54
EVOLUTION_EXTERNAL_PORT=8085

RECORDATORIOS_ENABLED=true
RECORDATORIOS_HORAS_ANTICIPACION=24
```

## Flujo recomendado

1. Levantar Evolution API en un servidor propio o VPS.
2. Crear una instancia (ejemplo: `turnero`).
3. Vincular WhatsApp escaneando el QR con el numero/chip que vas a usar.
4. Copiar API key e instance name a las variables del backend.
5. Reiniciar backend y probar envio manual:
   - `POST /api/turnos/{id}/enviar-confirmacion`
   - `POST /api/turnos/{id}/enviar-recordatorio`

## Levantar todo con Docker Compose

Desde la raiz del proyecto:

```bash
docker compose up -d evolution db backend frontend
```

Verificar que Evolution levanto:

```bash
docker compose ps evolution
```

Si queres ver logs:

```bash
docker compose logs -f evolution
```

## Conectar tu numero (QR)

Con la config actual, Evolution queda expuesto en `http://localhost:8085`.

1. Abrir el manager web:

- `http://localhost:8085/manager`

2. Crear o abrir la instancia `turnero` y presionar conectar.

3. Escanear el QR desde WhatsApp:

- WhatsApp > Dispositivos vinculados > Vincular dispositivo.

4. Confirmar que la instancia quede en estado conectada.

### Alternativa por API

1. Crear la instancia (si no existe):

```bash
curl -X POST "http://localhost:8085/instance/create" \
   -H "Content-Type: application/json" \
   -H "apikey: TU_API_KEY" \
   -d '{"instanceName":"turnero","qrcode":true,"integration":"WHATSAPP-BAILEYS"}'
```

2. Solicitar conexion/QR:

```bash
curl -X GET "http://localhost:8085/instance/connect/turnero" \
   -H "apikey: TU_API_KEY"
```

3. Confirmar estado conectado:

```bash
curl -X GET "http://localhost:8085/instance/fetchInstances" \
   -H "apikey: TU_API_KEY"
```

Si en tu version de Evolution cambia algun endpoint, revisa la documentacion Swagger de la instancia y usa la misma API key.

## Formato de numeros

El backend normaliza telefonos al formato de digitos para Evolution API (por defecto pais 54). Ejemplo:

- `11 1234-5678` -> `5491112345678`
- `+54 9 11 1234 5678` -> `5491112345678`

## Notas operativas

- Si `EVOLUTION_WHATSAPP_ENABLED=false`, no se envian mensajes.
- Si tu instancia exige API key y no esta configurada, los envios van a fallar.
- Los recordatorios automaticos dependen de `RECORDATORIOS_ENABLED`.
