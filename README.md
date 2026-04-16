# 🎨 Sistema de Turnos para Peluquería

Sistema completo de gestión de turnos para peluquerías desarrollado con **Spring Boot 3**, **Angular 17+**, **PostgreSQL** y **Docker**.

## � Despliegue Rápido con Docker

### Inicio Rápido (5 minutos)

```bash
# 1. Copiar y configurar variables de entorno
cp .env.example .env
nano .env  # Editar con tus valores

# 2. Desplegar
./deploy-donweb.sh  # Linux/Mac
# o
deploy-donweb.bat   # Windows

# 3. Acceder
# Frontend: http://localhost
# Backend: http://localhost:8080/api
# Swagger: http://localhost:8080/swagger-ui.html
```

📚 **Guías de Despliegue:**
- [QUICK-START-DONWEB.md](./QUICK-START-DONWEB.md) - Inicio rápido
- [DOCKER-GUIDE.md](./DOCKER-GUIDE.md) - Guía completa de Docker
- [DEPLOYMENT-DONWEB.md](./DEPLOYMENT-DONWEB.md) - Despliegue detallado en DonWeb
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - Lista de verificación

## 🚀 Características Principales

### Backend (Spring Boot 3 + Java 17)
- ✅ **Entidades JPA** con relaciones (Empleado, Servicio, Turno)
- ✅ **Validación de solapamiento** usando LocalDateTime y queries JPQL
- ✅ **Spring Security con JWT** (roles ADMIN y USER)
- ✅ **API REST** documentada con Swagger/OpenAPI
- ✅ **PostgreSQL** como base de datos
- ✅ **Docker multi-stage build** para producción
- ✅ **Health checks** con Spring Boot Actuator

### Frontend (Angular 17+ Standalone)
- ✅ **Signals de Angular** para estado reactivo
- ✅ **FullCalendar** para visualización de turnos
- ✅ **Componentes standalone** (sin NgModules)
- ✅ **Autenticación JWT**
- ✅ **Nginx** para servir en producción
- ✅ **Configuración dinámica** vía variables de entorno

### Lógica de Negocio Crítica
- 🔒 **Prevención de solapamiento**: Validación con la fórmula `(InicioNuevo < FinExistente) AND (FinNuevo > InicioExistente)`
- ⏰ **Cálculo automático** de fecha/hora fin basado en duración del servicio
- 👥 **Multi-empleado**: Cada empleado tiene su propia agenda independiente
- 🕐 **Validación de horarios laborales**: Los turnos deben estar dentro del horario del empleado

## 📋 Estructura del Proyecto

```
turnero-peluqueria/
├── 📄 docker-compose.yml            # Docker Compose para desarrollo
├── 📄 docker-compose.prod.yml      # Docker Compose para producción
├── 📄 .env.example                 # Template de variables de entorno
├── 📄 init-db.sql                  # Script de inicialización de BD
├── 🚀 deploy-donweb.sh            # Script de despliegue Linux/Mac
├── 🚀 deploy-donweb.bat           # Script de despliegue Windows
├── 🚀 deploy-donweb.ps1           # Script de despliegue PowerShell
├── 💾 backup-db.sh                # Script de backup de BD
├── initial-scaffolding/            # Backend Spring Boot
│   ├── src/main/java/
│   │   └── ar/edu/utn/frc/tup/lc/ii/
│   │       ├── entities/          # Empleado, Servicio, Turno, Usuario
│   │       ├── repositories/      # Repositories con queries de solapamiento
│   │       ├── services/          # Lógica de negocio y validaciones
│   │       ├── controllers/       # REST Controllers
│   │       ├── dtos/             # Data Transfer Objects
│   │       └── config/           # Configuración de seguridad JWT
│   ├── Dockerfile                 # Imagen Docker del backend
│   ├── .dockerignore             # Archivos a ignorar
│   └── pom.xml                   # Dependencias Maven
├── front/                         # Frontend Angular
│   ├── src/app/
│   │   ├── models/               # Interfaces TypeScript
│   │   ├── services/             # Services con Signals
│   │   └── components/           # Login y Calendario
│   ├── Dockerfile                # Imagen Docker del frontend
│   ├── .dockerignore            # Archivos a ignorar
│   ├── nginx.conf               # Configuración de Nginx
│   ├── docker-entrypoint.sh     # Script de inicialización
│   └── package.json             # Dependencias npm
└── docker-compose.yml
```

## 🛠️ Tecnologías Utilizadas

### Backend
- Java 17
- Spring Boot 3.5.0
- Spring Security + JWT (jjwt 0.12.3)
- Spring Data JPA
- PostgreSQL 16
- Lombok
- Maven

### Frontend
- Angular 19.2
- TypeScript 5.7
- Signals (nueva API de Angular)
- FullCalendar 6
- RxJS
- PrimeNG

## 🐳 Instalación y Ejecución

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar o navegar al directorio
cd turnero-peluqueria

# 2. Construir y ejecutar todos los servicios
docker-compose up --build

# 3. Acceder a la aplicación
# Frontend: http://localhost
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Opción 2: Desarrollo Local

#### Backend
```bash
cd initial-scaffolding

# Asegurarse de tener PostgreSQL corriendo
# Crear base de datos: turnero_peluqueria

# Ejecutar con Maven
./mvnw spring-boot:run

# O con Maven Wrapper en Windows
mvnw.cmd spring-boot:run
```

#### Frontend
```bash
cd front

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# La aplicación estará en http://localhost:4200
```

## 👤 Usuarios de Prueba

El sistema incluye usuarios de demostración:

| Usuario | Contraseña | Rol | Permisos |
|---------|-----------|-----|----------|
| admin | password | ADMIN | Gestión completa del sistema |
| cliente1 | password | USER | Crear turnos y ver disponibilidad |
| cliente2 | password | USER | Crear turnos y ver disponibilidad |

## 📊 Modelo de Datos

### Empleado
```java
- id: Long
- nombre: String
- especialidad: String
- horarioInicio: LocalTime
- horarioFin: LocalTime
- activo: Boolean
```

### Servicio
```java
- id: Long
- nombre: String
- duracionMinutos: Integer
- precio: BigDecimal
- descripcion: String
- activo: Boolean
```

### Turno
```java
- id: Long
- fechaHoraInicio: LocalDateTime
- fechaHoraFin: LocalDateTime (calculada automáticamente)
- clienteNombre: String
- clienteTelefono: String
- clienteEmail: String
- estado: EstadoTurno (RESERVADO, CONFIRMADO, FINALIZADO, CANCELADO)
- empleado: Empleado
- servicio: Servicio
- observaciones: String
```

## 🔍 Endpoints Principales

### Autenticación
```
POST /api/auth/login
```

### Empleados
```
GET  /api/empleados
GET  /api/empleados/{id}
```

### Servicios
```
GET  /api/servicios
GET  /api/servicios/{id}
```

### Turnos
```
POST /api/turnos                           # Crear turno (con validación de solapamiento)
GET  /api/turnos/{id}                      # Obtener turno
GET  /api/turnos?inicio=...&fin=...        # Listar turnos en rango
GET  /api/turnos/empleado/{id}             # Turnos de un empleado
GET  /api/turnos/disponibilidad            # Consultar disponibilidad
PUT  /api/turnos/{id}/cancelar             # Cancelar turno
PUT  /api/turnos/{id}/estado               # Actualizar estado
```

## 💡 Puntos Clave de Implementación

### 1. Validación de Solapamiento (Backend)
```java
@Query("SELECT t FROM Turno t WHERE t.empleado.id = :empleadoId " +
       "AND t.estado NOT IN ('CANCELADO', 'NO_ASISTIO') " +
       "AND (t.fechaHoraInicio < :finNuevo AND t.fechaHoraFin > :inicioNuevo)")
List<Turno> findTurnosSolapados(...);
```

### 2. Uso de LocalDateTime (nunca String)
```java
// ✅ CORRECTO
LocalDateTime fechaHoraInicio = request.getFechaHoraInicio();
LocalDateTime fechaHoraFin = fechaHoraInicio.plusMinutes(servicio.getDuracionMinutos());

// ❌ INCORRECTO
// String fecha = "2025-01-07 10:00:00"; // NO hacer esto!
```

### 3. Signals en Angular
```typescript
// Estado reactivo con Signals
turnos = signal<Turno[]>([]);
loading = signal<boolean>(false);

// Actualización inmutable
this.turnos.update(turnos => [...turnos, nuevoTurno]);
```

## 🔐 Seguridad

- JWT con expiración de 24 horas
- Contraseñas encriptadas con BCrypt
- CORS configurado
- Roles: ADMIN (gestión completa) y USER (lectura + crear turnos propios)

## 📝 Notas de Desarrollo

### Importante
- **Nunca usar String para fechas**: Siempre `LocalDateTime` en Java y `Date` en TypeScript
- **Validar solapamiento ANTES de guardar**: La query de solapamiento es crítica
- **Calcular fecha_hora_fin automáticamente**: Usar la duración del servicio
- **Índices en la BD**: Las columnas `empleado_id` y `fecha_hora_inicio` tienen índices para performance

### Mejoras Futuras
- [ ] Notificaciones por email/SMS
- [ ] Recordatorios automáticos
- [ ] Reportes y estadísticas
- [ ] Integración con calendario Google
- [ ] Panel de métricas en tiempo real
- [ ] Sistema de calificaciones
- [ ] Gestión de productos

## 🐛 Troubleshooting

### El backend no conecta con PostgreSQL
```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# Ver logs del contenedor
docker logs turnero-db
```

### Error de CORS en el frontend
Verificar que el backend tiene configurado CORS en `SecurityConfig.java`:
```java
.cors(cors -> cors.configure(http))
```

### FullCalendar no se muestra
```bash
# Verificar que se instalaron las dependencias
cd front
npm install
```

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Desarrollado por

Sistema desarrollado como proyecto académico siguiendo las mejores prácticas de arquitectura de software.

---

**¡Importante!** Este sistema implementa la lógica crítica de validación de solapamiento de turnos y usa las últimas características de Angular 17+ (Signals) y Spring Boot 3.
