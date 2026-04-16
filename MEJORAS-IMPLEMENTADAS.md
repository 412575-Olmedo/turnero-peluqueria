# Guía de Mejoras Implementadas

## 📋 Resumen de Cambios

Este documento describe las mejoras implementadas en el sistema de turnero de peluquería para mejorar la experiencia de usuario y soportar múltiples sucursales.

---

## 🏢 Soporte Multi-Sucursal

### Backend

#### 1. Nueva Entidad: Sucursal

**Ubicación**: `initial-scaffolding/src/main/java/ar/edu/utn/frc/tup/lc/ii/entities/Sucursal.java`

Campos principales:
- `nombre`: Nombre de la sucursal
- `direccion`: Dirección física
- `localidad`, `provincia`, `codigoPostal`: Ubicación geográfica
- `telefono`, `email`: Datos de contacto
- `horarioAtencion`: Descripción textual del horario
- `latitud`, `longitud`: Coordenadas para mapas (opcional)
- `activo`: Estado de la sucursal

#### 2. Relaciones Actualizadas

Las siguientes entidades ahora tienen relación con `Sucursal`:

**Empleado** (`Empleado.java`)
```java
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "sucursal_id")
private Sucursal sucursal;
```

**Turno** (`Turno.java`)
```java
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "sucursal_id")
private Sucursal sucursal;
```

**Producto** (`Producto.java`)
```java
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "sucursal_id")
private Sucursal sucursal;
```

**Servicio** (`Servicio.java`)
```java
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "sucursal_id")
private Sucursal sucursal;
```

#### 3. Nuevos Endpoints REST

**SucursalController** (`/api/sucursales`)

- `GET /api/sucursales` - Lista todas las sucursales
- `GET /api/sucursales/activas` - Lista solo sucursales activas
- `GET /api/sucursales/{id}` - Obtiene una sucursal por ID
- `POST /api/sucursales` - Crea nueva sucursal
- `PUT /api/sucursales/{id}` - Actualiza sucursal
- `PATCH /api/sucursales/{id}/activar` - Activa sucursal
- `PATCH /api/sucursales/{id}/desactivar` - Desactiva sucursal
- `GET /api/sucursales/buscar/localidad?localidad=X` - Busca por localidad
- `GET /api/sucursales/buscar/provincia?provincia=X` - Busca por provincia

#### 4. Migración de Base de Datos

Al ejecutar la aplicación, JPA creará automáticamente:
- Tabla `sucursales` con todos los campos
- Columna `sucursal_id` en tablas: `empleados`, `turnos`, `productos`, `servicios`
- Índices para optimizar consultas por sucursal

**Nota importante**: Para datos existentes, ejecutar este script SQL para crear una sucursal por defecto:

```sql
-- Crear sucursal principal
INSERT INTO sucursales (nombre, direccion, localidad, provincia, telefono, activo, fecha_creacion, fecha_modificacion)
VALUES ('Sucursal Principal', 'Tu Dirección', 'Tu Localidad', 'Tu Provincia', 'Tu Teléfono', true, NOW(), NOW());

-- Asociar registros existentes a la sucursal principal
UPDATE empleados SET sucursal_id = 1 WHERE sucursal_id IS NULL;
UPDATE turnos SET sucursal_id = 1 WHERE sucursal_id IS NULL;
UPDATE productos SET sucursal_id = 1 WHERE sucursal_id IS NULL;
UPDATE servicios SET sucursal_id = 1 WHERE sucursal_id IS NULL;
```

### Frontend

#### 1. Nuevo Servicio: SucursalService

**Ubicación**: `front/src/app/services/sucursal.service.ts`

Características:
- Gestión de sucursal actualmente seleccionada
- Persistencia en `localStorage`
- Signals de Angular para reactividad

Métodos principales:
```typescript
setSucursalActual(sucursal: Sucursal): void
getSucursalActualId(): number | null
listarActivas(): Observable<Sucursal[]>
crear(sucursal: Sucursal): Observable<Sucursal>
actualizar(id: number, sucursal: Sucursal): Observable<Sucursal>
```

#### 2. Componente Selector de Sucursal

**Ubicación**: `front/src/app/components/sucursal-selector/sucursal-selector.component.ts`

Uso:
```html
<!-- Agregar en el header o navbar -->
<app-sucursal-selector></app-sucursal-selector>
```

El componente:
- Muestra un dropdown con sucursales activas
- Persiste la selección
- Recarga la página al cambiar de sucursal

#### 3. Modelos Actualizados

**Ubicación**: `front/src/app/models/models.ts`

Se agregó `sucursalId?: number` a:
- `Empleado`
- `Servicio`
- `Turno`
- `TurnoRequest`

Se agregó nuevo modelo:
```typescript
export interface Sucursal {
  id?: number;
  nombre: string;
  direccion: string;
  localidad?: string;
  provincia?: string;
  // ... otros campos
  activo: boolean;
}
```

---

## 📱 Mejora de UX: Paneles Deslizables

### Problema Original

Los modales tradicionales tienen limitaciones en dispositivos móviles:
- Ocupan toda la pantalla o se ven comprimidos
- Difíciles de cerrar con el pulgar
- No aprovechan gestos nativos
- Mala experiencia en pantallas pequeñas

### Solución: Sliding Panels

#### 1. Componente Base: SlidingPanelComponent

**Ubicación**: `front/src/app/components/sliding-panel/sliding-panel.component.ts`

Características:
- Panel que se desliza desde la derecha
- Animaciones suaves
- Overlay con transparencia
- Adaptativo según tamaño de pantalla
- Botones optimizados para móvil

Uso:
```html
<app-sliding-panel 
  [isOpen]="mostrarPanel"
  [title]="'Título del Panel'"
  (onClose)="cerrarPanel()">
  
  <!-- Contenido del formulario aquí -->
  
</app-sliding-panel>
```

#### 2. Componente Ejemplo: EmpleadoFormComponent

**Ubicación**: `front/src/app/components/empleado-form/empleado-form.component.ts`

Ejemplo de conversión de modal a sliding panel:

**Antes (Modal)**:
```html
@if (mostrarFormEmpleado()) {
  <div class="modal-overlay" (click)="cerrarFormEmpleado()">
    <div class="modal-content" (click)="$event.stopPropagation()">
      <!-- Formulario -->
    </div>
  </div>
}
```

**Después (Sliding Panel)**:
```html
<app-empleado-form
  [isOpen]="mostrarFormEmpleado()"
  [empleado]="empleadoEditando()"
  (onClose)="cerrarFormEmpleado()"
  (onSave)="guardarEmpleado($event)">
</app-empleado-form>
```

#### 3. Ventajas del Nuevo Sistema

**Móvil**:
- Panel ocupa 100% del ancho
- Botón "atrás" accesible con el pulgar izquierdo
- Cierre con gesto de swipe (próxima mejora)
- Sin zoom ni problemas de scroll

**Desktop**:
- Panel lateral de 500-600px
- No interrumpe vista del contenido principal
- Botón X estándar para cerrar
- Puede trabajar con múltiples paneles

### Componentes a Convertir

Los siguientes modales deben migrarse al sistema de sliding panels:

1. **Panel Admin** (`panel-admin.component.html`):
   - ✅ Modal empleados → `EmpleadoFormComponent`
   - ⏳ Modal servicios → Crear `ServicioFormComponent`
   - ⏳ Modal horarios → Crear `HorarioFormComponent`
   - ⏳ Modal detalle turno → Crear `TurnoDetalleComponent`

2. **Stock Empleado** (`stock-empleado.component.html`):
   - ⏳ Modal consumo → Crear `ConsumoFormComponent`

3. **Gestión Stock** (`gestion-stock.component.html`):
   - ⏳ Modal producto → Crear `ProductoFormComponent`

---

## 🔄 Flujo de Trabajo Multi-Sucursal

### Para Usuarios

1. Al ingresar, seleccionar sucursal en el selector
2. Todos los datos mostrados son de esa sucursal
3. Al crear turno/empleado/producto, se asocia automáticamente
4. Cambiar de sucursal recarga la aplicación

### Para Desarrolladores

#### Filtrar datos por sucursal:

**Backend** (actualizar servicios existentes):
```java
public List<Empleado> listarEmpleadosActivos(Long sucursalId) {
    if (sucursalId == null) {
        return empleadoRepository.findByActivoTrue();
    }
    return empleadoRepository.findBySucursalIdAndActivoTrue(sucursalId);
}
```

**Frontend** (en servicios):
```typescript
listarEmpleados(): Observable<Empleado[]> {
  const sucursalId = this.sucursalService.getSucursalActualId();
  const params = sucursalId ? { sucursalId: sucursalId.toString() } : {};
  return this.http.get<Empleado[]>(`${this.apiUrl}/empleados`, { params });
}
```

#### Crear con sucursal:

**Backend** (en DTOs):
```java
@Data
public class EmpleadoDTO {
    private String nombre;
    private String especialidad;
    private Long sucursalId; // Nuevo campo
    // ... otros campos
}
```

**Frontend** (al enviar):
```typescript
crearEmpleado(empleado: Empleado): Observable<Empleado> {
  const sucursalId = this.sucursalService.getSucursalActualId();
  const data = { ...empleado, sucursalId };
  return this.http.post<Empleado>(`${this.apiUrl}/empleados`, data);
}
```

---

## 📝 Tareas Pendientes

### Backend
- [ ] Actualizar repositorios con métodos `findBySucursalId`
- [ ] Actualizar servicios para filtrar por sucursal
- [ ] Actualizar controladores para recibir `sucursalId` como parámetro
- [ ] Agregar validaciones de sucursal en DTOs
- [ ] Crear datos de prueba para múltiples sucursales

### Frontend
- [x] Crear `SucursalService`
- [x] Crear `SucursalSelectorComponent`
- [x] Actualizar modelos con `sucursalId`
- [x] Crear `SlidingPanelComponent`
- [x] Crear `EmpleadoFormComponent` (ejemplo)
- [ ] Convertir todos los modales a sliding panels
- [ ] Actualizar todos los servicios para enviar `sucursalId`
- [ ] Agregar panel de gestión de sucursales en admin
- [ ] Implementar gestos swipe para cerrar panels
- [ ] Agregar selector de sucursal en página de reserva pública

### Base de Datos
- [ ] Ejecutar script de migración para datos existentes
- [ ] Crear sucursales de ejemplo
- [ ] Actualizar índices de base de datos

---

## 🚀 Cómo Implementar

### 1. Iniciar Backend

```bash
cd initial-scaffolding
./mvnw spring-boot:run
```

### 2. Crear Sucursal por Defecto

Ejecutar en la base de datos PostgreSQL:
```sql
INSERT INTO sucursales (nombre, direccion, localidad, provincia, telefono, activo, fecha_creacion, fecha_modificacion)
VALUES ('Sucursal Centro', 'Av. Principal 123', 'Córdoba', 'Córdoba', '351-123-4567', true, NOW(), NOW());
```

### 3. Iniciar Frontend

```bash
cd front
npm install
ng serve
```

### 4. Probar Selector de Sucursal

Agregar en `app.component.html`:
```html
<app-sucursal-selector></app-sucursal-selector>
```

### 5. Convertir Modal a Sliding Panel

Ver ejemplo en `EmpleadoFormComponent` y replicar patrón.

---

## 📞 Soporte

Para dudas o sugerencias sobre estas mejoras, revisar:
- Código de `SlidingPanelComponent` para entender el sistema
- Ejemplo de `EmpleadoFormComponent` para ver implementación completa
- `SucursalService` para lógica de gestión de sucursales

---

**Última actualización**: Marzo 2026
**Versión**: 2.0.0
