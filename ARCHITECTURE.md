# 🏗️ Arquitectura del Sistema de Turnos

## Resumen Ejecutivo

Sistema de gestión de turnos para peluquerías construido con arquitectura de 3 capas, implementando **patrones de diseño modernos** y **mejores prácticas de la industria**.

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                   Angular 17+ (Port 80)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login      │  │  Calendario  │  │  Servicios   │      │
│  │  Component   │  │  Component   │  │   Signals    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                 │               │
│           └────────────────┴─────────────────┘               │
│                          │                                   │
│                    HTTP + JWT                                │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                             │
│               Spring Boot 3 (Port 8080)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Controllers Layer                       │   │
│  │  [AuthController] [TurnoController] [EmpleadoCtrl]  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Service Layer                          │   │
│  │  [TurnoService] [EmpleadoService] [ServicioService] │   │
│  │  • Lógica de validación de solapamiento             │   │
│  │  • Cálculo de fecha/hora fin                        │   │
│  │  • Validación de horarios laborales                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             Repository Layer (JPA)                   │   │
│  │  [TurnoRepo] [EmpleadoRepo] [ServicioRepo]          │   │
│  │  • Queries JPQL para solapamiento                   │   │
│  │  • Índices optimizados                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Security Layer                          │   │
│  │  [JWT Filter] [SecurityConfig] [UserDetailsService] │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      BASE DE DATOS                           │
│                PostgreSQL 16 (Port 5432)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Empleados│  │ Servicios│  │  Turnos  │  │ Usuarios │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       │             │              │              │          │
│       └─────────────┴──────────────┴──────────────┘          │
│                 Relaciones JPA                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Creación de Turno (Critical Path)

```
1. Usuario selecciona fecha/hora en calendario
   │
   ▼
2. Frontend envía TurnoRequestDTO
   POST /api/turnos
   Headers: Authorization: Bearer <JWT>
   Body: {
     empleadoId, servicioId, fechaHoraInicio,
     clienteNombre, clienteTelefono, ...
   }
   │
   ▼
3. JWT Filter valida el token
   │
   ▼
4. TurnoController recibe el request
   @Valid valida los datos del DTO
   │
   ▼
5. TurnoService.crearTurno()
   ├─→ 5.1. Validar empleado existe y está activo
   ├─→ 5.2. Validar servicio existe y está activo
   ├─→ 5.3. CALCULAR fecha_hora_fin
   │        fechaFin = fechaInicio + servicio.duracionMinutos
   ├─→ 5.4. Validar horario laboral del empleado
   │        if (horaInicio < empleado.horarioInicio || 
   │            horaFin > empleado.horarioFin)
   │            → throw Exception
   ├─→ 5.5. VALIDACIÓN CRÍTICA: Verificar solapamiento
   │        Query: findTurnosSolapados(empleadoId, inicio, fin)
   │        Si (inicioNuevo < finExistente) AND 
   │           (finNuevo > inicioExistente)
   │           → HAY SOLAPAMIENTO → throw Exception
   └─→ 5.6. Si todas las validaciones OK → guardar turno
   │
   ▼
6. TurnoRepository.save()
   Hibernate genera INSERT con todas las relaciones
   │
   ▼
7. PostgreSQL ejecuta el INSERT
   Verifica constraints y FK
   │
   ▼
8. Response TurnoResponseDTO
   Status 201 Created
   Body: { id, fechaHoraInicio, fechaHoraFin, ... }
   │
   ▼
9. Frontend actualiza el calendario
   turnos.update(turnos => [...turnos, nuevoTurno])
   FullCalendar se re-renderiza automáticamente
```

## 🎯 Componentes Clave

### Backend

#### 1. TurnoService - Lógica de Negocio
```java
@Service
public class TurnoServiceImpl {
    
    // MÉTODO CRÍTICO: Validación de solapamiento
    public boolean verificarDisponibilidad(...) {
        List<Turno> turnosSolapados = 
            turnoRepository.findTurnosSolapados(
                empleadoId, inicio, fin, null
            );
        return turnosSolapados.isEmpty();
    }
}
```

#### 2. TurnoRepository - Query de Solapamiento
```java
@Query("SELECT t FROM Turno t WHERE t.empleado.id = :empleadoId " +
       "AND t.estado NOT IN ('CANCELADO', 'NO_ASISTIO') " +
       "AND (t.fechaHoraInicio < :finNuevo AND " +
       "     t.fechaHoraFin > :inicioNuevo)")
List<Turno> findTurnosSolapados(...);
```

**Explicación de la lógica:**
- Dos rangos se solapan si el inicio de uno es antes del fin del otro
- Y el fin de uno es después del inicio del otro
- Esta es la fórmula matemática estándar para detectar solapamiento de intervalos

#### 3. SecurityConfig - Protección de Endpoints
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(...) {
        // Endpoints públicos
        .requestMatchers("/api/auth/**").permitAll()
        
        // Crear turnos - todos autenticados
        .requestMatchers("POST", "/api/turnos").hasAnyRole("ADMIN", "USER")
        
        // Gestión completa - solo ADMIN
        .requestMatchers("/api/turnos/**").hasRole("ADMIN")
    }
}
```

### Frontend

#### 1. TurnoService - Estado con Signals
```typescript
@Injectable({ providedIn: 'root' })
export class TurnoService {
    // Signals para estado reactivo
    turnos = signal<Turno[]>([]);
    loading = signal<boolean>(false);
    error = signal<string | null>(null);
    
    crearTurno(request: TurnoRequest) {
        // Actualización inmutable del signal
        this.turnos.update(turnos => [...turnos, nuevoTurno]);
    }
}
```

#### 2. CalendarioComponent - Computed Signals
```typescript
@Component({ ... })
export class CalendarioComponent {
    // Computed signal que se recalcula automáticamente
    calendarOptions = computed<CalendarOptions>(() => ({
        events: this.convertirTurnosAEventos(
            this.turnoService.turnos() // ← Signal
        )
    }));
}
```

## 🔐 Seguridad

### Flujo de Autenticación JWT

```
1. Usuario envía credenciales
   POST /api/auth/login
   │
   ▼
2. Spring Security valida con UserDetailsService
   │
   ▼
3. Si es válido, genera JWT con rol
   Token = Header.Payload.Signature
   Payload contiene: { username, role, exp }
   │
   ▼
4. Frontend guarda token en localStorage
   │
   ▼
5. Cada request incluye header:
   Authorization: Bearer <token>
   │
   ▼
6. JwtAuthenticationFilter intercepta
   - Extrae token
   - Valida firma
   - Verifica expiración
   - Carga usuario en SecurityContext
   │
   ▼
7. Request llega al controller con
   autenticación completa
```

## 📦 Modelo de Datos - Relaciones

```
┌─────────────┐
│  Usuario    │
│─────────────│
│ id          │
│ username    │
│ password    │
│ rol         │ ← ADMIN / USER
└─────────────┘


┌─────────────┐              ┌─────────────┐
│  Empleado   │              │  Servicio   │
│─────────────│              │─────────────│
│ id          │              │ id          │
│ nombre      │              │ nombre      │
│ especialidad│              │ duracion_min│
│ horario_ini │              │ precio      │
│ horario_fin │              └─────────────┘
└─────────────┘                     │
       │                            │
       │                            │
       │        ┌─────────────┐     │
       └────────│   Turno     │─────┘
                │─────────────│
                │ id          │
                │ fecha_ini   │ ← LocalDateTime
                │ fecha_fin   │ ← Calculado automáticamente
                │ cliente_nom │
                │ cliente_tel │
                │ estado      │ ← Enum
                │ empleado_id │ ← FK
                │ servicio_id │ ← FK
                └─────────────┘

Relaciones:
- Empleado → Turno: OneToMany
- Servicio → Turno: OneToMany
- Turno → Empleado: ManyToOne (EAGER)
- Turno → Servicio: ManyToOne (EAGER)
```

## 🚀 Tecnologías y Versiones

### Backend Stack
```
Java 17
Spring Boot 3.5.0
  ├─ Spring Security 6.x
  ├─ Spring Data JPA
  ├─ Spring Web
  └─ Validation
PostgreSQL 16
Hibernate 6.x
JWT (jjwt) 0.12.3
Lombok
Maven 3.9
```

### Frontend Stack
```
Angular 19.2
  ├─ Signals (nueva API)
  ├─ Standalone Components
  └─ HttpClient
TypeScript 5.7
FullCalendar 6.1
RxJS 7.8
Node 20
npm / Angular CLI 19
```

### DevOps
```
Docker 24+
Docker Compose 2.x
Nginx Alpine
Maven Alpine
PostgreSQL Alpine
```

## 📈 Performance y Escalabilidad

### Índices de Base de Datos
```sql
-- Índice compuesto para query de solapamiento
CREATE INDEX idx_empleado_fecha 
ON turnos(empleado_id, fecha_hora_inicio);

-- Índice para filtro por estado
CREATE INDEX idx_estado ON turnos(estado);

-- Índice para búsqueda por cliente
CREATE INDEX idx_cliente_telefono 
ON turnos(cliente_telefono);
```

### Optimizaciones
1. **Queries eficientes**: JPQL optimizado con joins
2. **Fetch EAGER**: Solo para relaciones siempre necesarias
3. **Transacciones**: `@Transactional` en capa de servicio
4. **Caching**: Signals en frontend evitan re-renders innecesarios
5. **Lazy Loading**: Componentes Angular standalone

## 🔄 Ciclo de Vida de un Turno

```
RESERVADO ─────────────────────────────────────┐
    │                                          │
    │ (admin confirma)                         │
    ▼                                          │
CONFIRMADO                                     │
    │                                          │
    │ (empleado inicia servicio)               │
    ▼                                          │
EN_CURSO                                       │
    │                                          │
    │ (empleado finaliza)                      │
    ▼                                          │
FINALIZADO                                     │
                                               │
    (cualquier momento) ────────▶ CANCELADO   │
                                               │
    (no se presenta) ─────────▶ NO_ASISTIO    │
                                               │
                                               ▼
                        (fin del ciclo)
```

## 🎓 Patrones de Diseño Implementados

1. **Repository Pattern**: Abstracción de acceso a datos
2. **Service Layer**: Lógica de negocio centralizada
3. **DTO Pattern**: Separación de modelos de dominio y API
4. **Builder Pattern**: Construcción de objetos complejos
5. **Dependency Injection**: IoC de Spring
6. **Observer Pattern**: Signals y RxJS
7. **Strategy Pattern**: Diferentes validaciones por tipo
8. **Filter Pattern**: JWT Authentication Filter

## 🧪 Testing Strategy

### Backend
- **Unit Tests**: Servicios con Mockito
- **Integration Tests**: Repositories con H2
- **E2E Tests**: Controllers con MockMvc

### Frontend
- **Unit Tests**: Servicios y componentes con Jasmine
- **E2E Tests**: Protractor o Cypress

## 🔮 Mejoras Futuras

### Fase 2
- [ ] Notificaciones push
- [ ] Sistema de recordatorios
- [ ] Panel de métricas en tiempo real
- [ ] Exportación de reportes PDF/Excel

### Fase 3
- [ ] App móvil (React Native o Flutter)
- [ ] Integración con Google Calendar
- [ ] Pagos online
- [ ] Sistema de fidelización

### Optimizaciones
- [ ] Redis para caching
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Elasticsearch para búsqueda avanzada
- [ ] Kubernetes para orquestación

---

**Documentado el 7 de Enero de 2025**
