# 🚀 Ejecución Local (Sin Docker)

## ✅ Requisitos
- Java 17+
- Node.js 18+ y npm
- Maven (incluido con mvnw)

## 📋 Instrucciones

### 1️⃣ Backend (Spring Boot + H2)

Abrí una terminal y ejecutá:

```powershell
cd "C:\Users\thiag\OneDrive\Escritorio\turnero-peluqueria\initial-scaffolding"
set SPRING_PROFILES_ACTIVE=local
mvnw.cmd spring-boot:run
```

O simplemente:
```powershell
cd "C:\Users\thiag\OneDrive\Escritorio\turnero-peluqueria\initial-scaffolding"
.\run-local.bat
```

**Esperá a ver** el mensaje:
```
Started Application in X.XXX seconds
```

El backend estará disponible en:
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- H2 Console: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:turnero_peluqueria`
  - Username: `sa`
  - Password: (vacío)

### 2️⃣ Frontend (Angular)

En **otra terminal**, ejecutá:

```powershell
cd "C:\Users\thiag\OneDrive\Escritorio\turnero-peluqueria\front"
npm install
npm start
```

O usando el script:
```powershell
cd "C:\Users\thiag\OneDrive\Escritorio\turnero-peluqueria\front"
.\run-local.ps1
```

El frontend estará disponible en:
- http://localhost:4200

## 🔐 Credenciales de Prueba

### Admin
- Username: `admin`
- Password: `password`

### Clientes
- Username: `cliente1` / Password: `password`
- Username: `cliente2` / Password: `password`

## 🗂️ Datos Precargados

La base de datos H2 se inicializa automáticamente con:
- ✅ 3 empleados (Carlos, Ana, Luis)
- ✅ 6 servicios (Corte, Barba, Coloración, etc.)
- ✅ 3 usuarios (admin, cliente1, cliente2)

## 🛠️ Troubleshooting

### Backend no inicia
- Verificá que el puerto 8080 esté libre
- Revisá los logs en busca de errores de compilación

### Frontend no inicia
- Ejecutá `npm install` para instalar dependencias
- Verificá que el puerto 4200 esté libre

### Error de CORS
- Verificá que el backend tenga `cors.allowed-origins=http://localhost:4200` en `application-local.properties`

## 📝 Notas

- El perfil `local` usa H2 en memoria (los datos se pierden al cerrar)
- Para usar PostgreSQL, usá el perfil `dev` o corre con Docker
- El backend con H2 es ideal para pruebas rápidas
