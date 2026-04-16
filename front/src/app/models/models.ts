export interface Empleado {
  id: number;
  nombre: string;
  especialidad: string;
  activo: boolean;
  precioHora?: number;
  username?: string;
  email?: string;
  password?: string;
  servicios?: Servicio[]; // Servicios que ofrece el empleado
  sucursalId?: number; // Sucursal a la que pertenece
}

export interface Servicio {
  id: number;
  nombre: string;
  duracionMinutos: number;
  precio: number;
  descripcion: string;
  activo: boolean;
  sucursalId?: number; // Sucursal en la que se ofrece
}

export interface Sucursal {
  id?: number;
  nombre: string;
  direccion: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
  telefono?: string;
  email?: string;
  horarioAtencion?: string;
  latitud?: string;
  longitud?: string;
  activo: boolean;
}

export enum EstadoTurno {
  RESERVADO = 'RESERVADO',
  CONFIRMADO = 'CONFIRMADO',
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
  NO_ASISTIO = 'NO_ASISTIO'
}

export interface Turno {
  id: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string;
  estado: EstadoTurno;
  observaciones?: string;
  empleadoId: number;
  empleadoNombre: string;
  empleadoEspecialidad: string;
  servicioId: number;
  servicioNombre: string;
  servicioDuracion: number;
  servicioPrecio: string;
  fechaCreacion: string;
  codigoConfirmacion?: string;
  sucursalId?: number;
}

export interface TurnoRequest {
  empleadoId: number;
  servicioId: number;
  fechaHoraInicio: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string;
  observaciones?: string;
  sucursalId?: number;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  nombre: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface DisponibilidadResponse {
  empleadoId: number;
  empleadoNombre: string;
  fecha: string;
  horariosDisponibles: HorarioDisponible[];
}

export interface HorarioDisponible {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}

// Nuevas interfaces para horarios de empleado
export interface HorarioEmpleado {
  id?: number;
  empleadoId: number;
  diaSemana: number; // 1=Lunes, 7=Domingo
  diaNombre: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  descansoMinutos: number;
}

export interface SlotDisponible {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  motivo?: string;
}

export interface SlotsDelDia {
  fecha: string;
  empleadoId: number;
  empleadoNombre: string;
  servicioId: number;
  servicioNombre: string;
  duracionMinutos: number;
  slots: SlotDisponible[];
  totalDisponibles: number;
  estadoDia: 'MUY_OCUPADO' | 'DISPONIBLE' | 'POCAS_VACANTES';
}

export interface CancelarTurnoRequest {
  codigoCancelacion: string;
  telefono?: string;
  motivo?: string;
}

export interface BloqueoHorario {
  id?: number;
  empleadoId?: number;
  empleadoNombre?: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
  motivo: string;
  tipo: 'VACACIONES' | 'FERIADO' | 'REUNION' | 'CAPACITACION' | 'OTRO';
}

// Productos e Inventario
export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string;
  categoria: string; // SHAMPOO, TINTE, CERA, TOALLA, OTRO
  stockActual: number;
  stockMinimo: number;
  unidad: string; // und, ml, gr
  activo: boolean;
  sucursalId?: number;
  stockBajo?: boolean; // Calculado
}

export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
  MERMA = 'MERMA'
}

export interface MovimientoStockRequest {
  cantidad: number;
  tipo: TipoMovimiento;
  motivo?: string;
}

export interface StockMovimiento {
  id: number;
  productoId: number;
  productoNombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo?: string;
  usuarioNombre: string;
  fechaMovimiento: string;
}

// Asistencia y Jornadas Laborales
export interface JornadaTrabajo {
  id: number;
  empleadoId: number;
  empleadoNombre: string;
  fecha: string; // LocalDate
  horaEntrada: string; // LocalDateTime
  horaSalida?: string; // LocalDateTime
  horasTrabajadas?: number;
  montoAPagar?: number;
  pagado: boolean;
  fechaPago?: string;
  observaciones?: string;
}

export interface JornadaActual {
  trabajando: boolean;
  jornadaId?: number;
  horaEntrada?: string;
  tiempoTranscurrido?: string; // "7h 45m"
  minutosTrabajados?: number;
}

export interface ResumenMensual {
  empleadoId: number;
  empleadoNombre: string;
  mes: number;
  anio: number;
  totalJornadas: number;
  totalHoras: number;
  precioHora: number;
  totalAPagar: number;
  totalPagado: number;
  totalPendiente: number;
  jornadas: JornadaTrabajo[];
}

export interface MarcarPagadoRequest {
  jornadaIds: number[];
  fechaPago?: string;
}

// Modelos para el sistema de reserva de turnos (cliente)
export interface ReservaState {
  paso: 1 | 2 | 3;
  servicioSeleccionado?: Servicio;
  empleadoSeleccionado?: Empleado;
  fechaSeleccionada?: string;
  horarioSeleccionado?: SlotDisponible;
  clienteInfo?: ClienteInfo;
}

export interface ClienteInfo {
  nombre: string;
  telefono: string;
  email?: string;
}

export interface DiaDisponibilidad {
  fecha: string;
  disponible: boolean;
  nivel: 'alto' | 'medio' | 'bajo' | 'sin';
  porcentajeDisponible: number;
}

export interface EmpleadoConCalificacion extends Empleado {
  calificacion?: number;
  totalResenas?: number;
}

