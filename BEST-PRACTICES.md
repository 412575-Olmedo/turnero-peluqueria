# 📚 Guía de Mejores Prácticas

## ✅ Checklist de Validaciones Críticas

### Backend - TurnoService

#### 1. ✅ Validación de Solapamiento
```java
// CORRECTO ✅
LocalDateTime fechaHoraInicio = request.getFechaHoraInicio();
LocalDateTime fechaHoraFin = fechaHoraInicio.plusMinutes(servicio.getDuracionMinutos());

List<Turno> turnosSolapados = turnoRepository.findTurnosSolapados(
    empleadoId, fechaHoraInicio, fechaHoraFin, null
);

if (!turnosSolapados.isEmpty()) {
    throw new IllegalStateException("Hay solapamiento de turnos");
}

// INCORRECTO ❌
// String fecha = request.getFecha(); // NO usar String para fechas
// No calcular fecha_fin → la BD lo hace automáticamente (MALO)
```

**Por qué es importante:**
- LocalDateTime permite operaciones matemáticas de tiempo
- String no permite comparaciones ni cálculos
- El solapamiento debe detectarse ANTES de insertar en la BD

#### 2. ✅ Validación de Horario Laboral
```java
// CORRECTO ✅
LocalTime horaInicio = fechaHoraInicio.toLocalTime();
LocalTime horaFin = fechaHoraFin.toLocalTime();

if (horaInicio.isBefore(empleado.getHorarioInicio())) {
    throw new IllegalArgumentException(
        "El turno inicia antes del horario laboral"
    );
}

if (horaFin.isAfter(empleado.getHorarioFin())) {
    throw new IllegalArgumentException(
        "El turno termina después del horario laboral"
    );
}

// INCORRECTO ❌
// if (horaInicio < empleado.getHorarioInicio()) // Comparación incorrecta
```

#### 3. ✅ Validación de Entidades Relacionadas
```java
// CORRECTO ✅
Empleado empleado = empleadoRepository.findByIdAndActivoTrue(empleadoId)
    .orElseThrow(() -> new ResourceNotFoundException(
        "Empleado no encontrado o inactivo con ID: " + empleadoId
    ));

// INCORRECTO ❌
// Empleado empleado = empleadoRepository.findById(empleadoId).get();
// ↑ Puede lanzar NoSuchElementException sin mensaje claro
// ↑ No valida que el empleado esté activo
```

### Frontend - Angular Signals

#### 1. ✅ Uso Correcto de Signals
```typescript
// CORRECTO ✅
// Definir signal
turnos = signal<Turno[]>([]);

// Actualizar de forma INMUTABLE
this.turnos.update(turnos => [...turnos, nuevoTurno]);

// Leer valor
const turnosActuales = this.turnos();

// INCORRECTO ❌
// this.turnos.set(this.turnos().push(nuevoTurno)); // Muta el array
// const turnos = this.turnos; // No invoca el getter
```

**Por qué es importante:**
- Los Signals detectan cambios solo si la referencia cambia
- Mutar el array directamente no dispara actualizaciones
- Siempre crear nuevo array con spread operator

#### 2. ✅ Computed Signals
```typescript
// CORRECTO ✅
calendarOptions = computed<CalendarOptions>(() => ({
    events: this.convertirTurnosAEventos(this.turnoService.turnos())
    //                                                      ↑ Se ejecuta cuando cambia
}));

// INCORRECTO ❌
// calendarOptions: CalendarOptions = {
//     events: this.convertirTurnosAEventos(this.turnoService.turnos)
//     //                                                      ↑ NO es reactivo
// };
```

#### 3. ✅ Manejo de Errores
```typescript
// CORRECTO ✅
this.turnoService.crearTurno(this.nuevoTurno).subscribe({
    next: (turno) => {
        this.cerrarFormulario();
        alert('Turno creado exitosamente');
    },
    error: (err) => {
        alert(err.error?.message || 'Error al crear el turno');
    }
});

// INCORRECTO ❌
// this.turnoService.crearTurno(this.nuevoTurno).subscribe(
//     turno => { /* success */ }
//     // ↑ No maneja errores
// );
```

## 🔒 Seguridad - Mejores Prácticas

### 1. ✅ Contraseñas
```java
// CORRECTO ✅
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// Al crear usuario
usuario.setPassword(passwordEncoder.encode(rawPassword));

// INCORRECTO ❌
// usuario.setPassword(rawPassword); // Guardar en texto plano
```

### 2. ✅ JWT Secret
```properties
# CORRECTO ✅ (producción)
jwt.secret=${JWT_SECRET:clave-por-defecto-solo-desarrollo}

# Generar con:
# openssl rand -base64 64

# INCORRECTO ❌
# jwt.secret=123456 // Clave débil y hardcodeada
```

### 3. ✅ Validación de Input
```java
// CORRECTO ✅
@NotNull(message = "El ID del empleado es obligatorio")
@Min(value = 1, message = "El ID debe ser mayor a 0")
private Long empleadoId;

@NotBlank(message = "El nombre del cliente es obligatorio")
@Size(min = 2, max = 100)
private String clienteNombre;

// INCORRECTO ❌
// private Long empleadoId; // Sin validaciones
// private String clienteNombre; // Podría ser null o vacío
```

## 🎯 Performance - Optimizaciones

### 1. ✅ Queries Eficientes
```java
// CORRECTO ✅
@Query("SELECT t FROM Turno t " +
       "JOIN FETCH t.empleado " +
       "JOIN FETCH t.servicio " +
       "WHERE t.empleado.id = :empleadoId")
List<Turno> findTurnosByEmpleado(@Param("empleadoId") Long id);

// INCORRECTO ❌
// List<Turno> findAll(); // Carga TODO y luego filtra en memoria
// for (Turno t : turnos) {
//     if (t.getEmpleado().getId().equals(empleadoId)) { ... }
// }
```

### 2. ✅ Índices de Base de Datos
```java
// CORRECTO ✅
@Table(name = "turnos", indexes = {
    @Index(name = "idx_empleado_fecha", columnList = "empleado_id, fecha_hora_inicio"),
    @Index(name = "idx_estado", columnList = "estado")
})
public class Turno { ... }

// INCORRECTO ❌
// @Table(name = "turnos") // Sin índices
```

### 3. ✅ Fetch Strategy
```java
// CORRECTO ✅
@ManyToOne(fetch = FetchType.EAGER) // Solo si SIEMPRE se necesita
@JoinColumn(name = "empleado_id")
private Empleado empleado;

@OneToMany(mappedBy = "empleado", fetch = FetchType.LAZY) // Lista grande
private List<Turno> turnos;

// INCORRECTO ❌
// @OneToMany(fetch = FetchType.EAGER) // Carga TODO siempre (N+1 problem)
```

## 📊 Testing - Casos Críticos

### Test 1: Solapamiento Directo
```java
@Test
void deberiaRechazarTurnosSolapados() {
    // Turno 1: 10:00 - 10:40
    TurnoRequest turno1 = crearRequest(empleado1, "2025-01-10T10:00:00");
    turnoService.crearTurno(turno1); // OK
    
    // Turno 2: 10:20 - 11:00 (solapa con turno1)
    TurnoRequest turno2 = crearRequest(empleado1, "2025-01-10T10:20:00");
    
    assertThrows(IllegalStateException.class, 
        () -> turnoService.crearTurno(turno2)
    );
}
```

### Test 2: Horario Laboral
```java
@Test
void deberiaRechazarTurnoFueraDeHorario() {
    // Empleado trabaja 09:00 - 18:00
    // Turno: 19:00 - 19:40 (fuera de horario)
    TurnoRequest turno = crearRequest(empleado1, "2025-01-10T19:00:00");
    
    assertThrows(IllegalArgumentException.class,
        () -> turnoService.crearTurno(turno)
    );
}
```

### Test 3: Múltiples Empleados
```java
@Test
void deberiaPermitirTurnosSimultaneosEnDiferentesEmpleados() {
    // Turno empleado1: 10:00 - 10:40
    TurnoRequest turno1 = crearRequest(empleado1, "2025-01-10T10:00:00");
    turnoService.crearTurno(turno1); // OK
    
    // Turno empleado2: 10:00 - 10:40 (mismo horario, otro empleado)
    TurnoRequest turno2 = crearRequest(empleado2, "2025-01-10T10:00:00");
    
    assertDoesNotThrow(() -> turnoService.crearTurno(turno2)); // OK
}
```

## 🚫 Anti-Patrones a Evitar

### ❌ 1. Usar String para fechas
```java
// MAL ❌
private String fechaHoraInicio;
private String fechaHoraFin;

// BIEN ✅
private LocalDateTime fechaHoraInicio;
private LocalDateTime fechaHoraFin;
```

### ❌ 2. No validar solapamiento
```java
// MAL ❌
public Turno crearTurno(TurnoRequest request) {
    Turno turno = new Turno();
    // ... setear campos
    return turnoRepository.save(turno); // Guarda sin validar
}

// BIEN ✅
public Turno crearTurno(TurnoRequest request) {
    // Validar empleado, servicio
    // VALIDAR SOLAPAMIENTO
    // Validar horario laboral
    return turnoRepository.save(turno);
}
```

### ❌ 3. Mutar signals directamente
```typescript
// MAL ❌
this.turnos().push(nuevoTurno); // Muta el array

// BIEN ✅
this.turnos.update(t => [...t, nuevoTurno]); // Crea nuevo array
```

### ❌ 4. Hardcodear valores
```java
// MAL ❌
if (usuario.getRol().equals("ADMIN")) { ... }

// BIEN ✅
if (usuario.getRol() == Usuario.Rol.ADMIN) { ... }
```

### ❌ 5. No usar transacciones
```java
// MAL ❌
public void crearTurno(...) {
    // Operaciones de BD sin @Transactional
}

// BIEN ✅
@Transactional
public void crearTurno(...) {
    // Rollback automático si hay error
}
```

## 📝 Convenciones de Código

### Nombres de Variables
```java
// BIEN ✅
LocalDateTime fechaHoraInicio;
List<Turno> turnosSolapados;
boolean hayConflicto;

// MAL ❌
LocalDateTime fhi; // Abreviación poco clara
List<Turno> lista; // Nombre genérico
boolean b; // Nombre de una letra
```

### Mensajes de Error
```java
// BIEN ✅
throw new IllegalStateException(
    String.format("El empleado %s ya tiene un turno en el horario %s - %s",
        empleado.getNombre(), inicio, fin)
);

// MAL ❌
throw new IllegalStateException("Error"); // Poco descriptivo
```

### Logs
```java
// BIEN ✅
log.info("Creando turno para empleado {} servicio {} en {}", 
    empleadoId, servicioId, fechaInicio);
log.warn("Encontrados {} turnos solapados", turnosSolapados.size());
log.error("Error al validar turno: {}", e.getMessage(), e);

// MAL ❌
System.out.println("Turno creado"); // Usar System.out
log.info("Error"); // Sin contexto
```

## 🎓 Recursos Adicionales

### Documentación Oficial
- [Spring Boot 3](https://spring.io/projects/spring-boot)
- [Angular Signals](https://angular.dev/guide/signals)
- [FullCalendar](https://fullcalendar.io/docs)
- [JWT](https://jwt.io/)

### Herramientas Útiles
- [Postman](https://www.postman.com/) - Testing de API
- [pgAdmin](https://www.pgadmin.org/) - Administración PostgreSQL
- [Angular DevTools](https://angular.dev/tools/devtools) - Debug Angular

---

**Última actualización: Enero 2025**
