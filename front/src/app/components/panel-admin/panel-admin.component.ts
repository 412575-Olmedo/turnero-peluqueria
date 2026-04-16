import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { environment } from '../../../env/environment';
import { GestionAsistenciaComponent } from '../../gestion-asistencia/gestion-asistencia.component';
import { Empleado, HorarioEmpleado, Servicio, Turno } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { EmpleadoService } from '../../services/empleado.service';
import { HorarioService } from '../../services/horario.service';
import { ServicioService } from '../../services/servicio.service';
import { SucursalService } from '../../services/sucursal.service';
import { TurnoService } from '../../services/turno.service';
import { GestionStockComponent } from '../gestion-stock/gestion-stock.component';
import { SucursalSelectorComponent } from '../sucursal-selector/sucursal-selector.component';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    GestionStockComponent,
    GestionAsistenciaComponent,
    SucursalSelectorComponent
  ],
  templateUrl: './panel-admin.component.html',
  styleUrls: ['./panel-admin.component.css']
})
export class PanelAdminComponent implements OnInit {
  private empleadoService = inject(EmpleadoService);
  private servicioService = inject(ServicioService);
  private turnoService = inject(TurnoService);
  private horarioService = inject(HorarioService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private sucursalService = inject(SucursalService);
  private apiUrl = environment.apiUrl;
  mensaje = signal<string | null>(null);
  errorAccion = signal<string | null>(null);

  constructor() {
    // Recargar datos cuando cambia la sucursal
    effect(() => {
      // Usar el signal de cambio para detectar cualquier cambio de sucursal
      this.sucursalService.getCambioSignal()();
      const sucursal = this.sucursalService.sucursalActual();
      if (sucursal) {
        console.log('Recargando datos para sucursal:', sucursal.nombre);
        this.cargarDatos();
      }
    });
  }

  // Tabs
  tabActiva = signal<'empleados' | 'servicios' | 'turnos' | 'horarios' | 'stock' | 'asistencia' | 'estadisticas'>('estadisticas');

  // Empleados
  empleados = this.empleadoService.empleados;
  empleadoEditando = signal<Empleado | null>(null);
  mostrarFormEmpleado = signal(false);
  
  nuevoEmpleado: Empleado = {
    id: 0,
    nombre: '',
    especialidad: '',
    activo: true,
    username: '',
    email: '',
    password: '',
    servicios: []
  };

  // IDs de servicios seleccionados para el empleado
  serviciosSeleccionados = signal<number[]>([]);

  // Servicios
  servicios = this.servicioService.servicios;
  servicioEditando = signal<Servicio | null>(null);
  mostrarFormServicio = signal(false);
  
  nuevoServicio: Servicio = {
    id: 0,
    nombre: '',
    descripcion: '',
    duracionMinutos: 30,
    precio: 5000,
    activo: true
  };

  // Turnos
  turnos = this.turnoService.turnos;
  colaboradorTurnosSeleccionado = signal<string>('');
  estadoTurnosSeleccionado = signal<string>('');
  turnoSeleccionado = signal<Turno | null>(null);
  mostrarDetalleTurno = signal(false);

  // EstadÃ­sticas
  estadisticas = signal({
    turnosHoy: 0,
    turnosSemana: 0,
    turnosMes: 0,
    ingresos: 0,
    clientesNuevos: 0
  });

  // Rango de fechas para dashboard interactivo
  fechaInicio = signal<string>(this.obtenerFechaInicio());
  fechaFin = signal<string>(this.obtenerFechaHoy());

  obtenerFechaInicio(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 30); // 30 dÃ­as atrÃ¡s por defecto
    return fecha.toISOString().split('T')[0];
  }

  obtenerFechaHoy(): string {
    return new Date().toISOString().split('T')[0]; // Fecha de hoy
  }

  // MÃ©todos de navegaciÃ³n
  cambiarTab(tab: 'empleados' | 'servicios' | 'turnos' | 'horarios' | 'stock' | 'asistencia' | 'estadisticas'): void {
    this.cerrarPanelesInline();
    this.tabActiva.set(tab);

    if (tab === 'horarios') {
      this.inicializarHorariosTab();
    }
  }

  ngOnInit(): void {
    this.cerrarPanelesInline();
    this.cargarDatos();
  }

  private cerrarPanelesInline(): void {
    this.mostrarFormEmpleado.set(false);
    this.mostrarFormServicio.set(false);
    this.mostrarDetalleTurno.set(false);
    this.mostrarFormHorario.set(false);
    this.empleadoEditando.set(null);
    this.servicioEditando.set(null);
    this.turnoSeleccionado.set(null);
    this.horarioEditando.set(null);
  }

  cargarDatos(): void {
    this.empleadoService.listarEmpleados(true).subscribe({
      next: () => {
        if (this.tabActiva() === 'horarios') {
          this.inicializarHorariosTab();
        }
      }
    });
    this.servicioService.listarServicios().subscribe();
    this.cargarTurnosActuales();
  }

  private inicializarHorariosTab(): void {
    if (this.empleadoHorariosSeleccionado()) {
      this.cargarHorariosEmpleado(this.empleadoHorariosSeleccionado()!);
      return;
    }

    const primerColaborador = this.empleados()[0];
    if (primerColaborador) {
      this.cargarHorariosEmpleado(primerColaborador.id);
    }
  }

  cargarTurnosActuales(): void {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 30);
    inicio.setHours(0, 0, 0, 0);
    
    const fin = new Date();
    fin.setDate(fin.getDate() + 30);
    fin.setHours(23, 59, 59, 999);
    
    this.turnoService.listarTurnos(inicio, fin).subscribe({
      next: () => this.calcularEstadisticas()
    });
  }

  // ========== EMPLEADOS ==========
  abrirFormEmpleado(empleado?: Empleado): void {
    this.mostrarFormServicio.set(false);
    this.mostrarDetalleTurno.set(false);

    if (empleado) {
      this.empleadoEditando.set({ ...empleado });
      // Cargar IDs de servicios del empleado
      this.serviciosSeleccionados.set(empleado.servicios?.map(s => s.id) || []);
    } else {
      this.empleadoEditando.set(null);
      this.nuevoEmpleado = {
        id: 0,
        nombre: '',
        especialidad: '',
        activo: true,
        username: '',
        email: '',
        password: '',
        servicios: []
      };
      this.serviciosSeleccionados.set([]);
    }
    this.mostrarFormEmpleado.set(true);
  }

  esServicioSeleccionado(servicioId: number): boolean {
    return this.serviciosSeleccionados().includes(servicioId);
  }

  toggleServicioEmpleado(servicioId: number): void {
    const actual = this.serviciosSeleccionados();
    if (actual.includes(servicioId)) {
      this.serviciosSeleccionados.set(actual.filter(id => id !== servicioId));
    } else {
      this.serviciosSeleccionados.set([...actual, servicioId]);
    }
  }

  guardarEmpleado(): void {
    this.mensaje.set(null);
    this.errorAccion.set(null);
    const empleadoEditado = this.empleadoEditando();
    const empleadoPayload = empleadoEditado ? { ...empleadoEditado } : { ...this.nuevoEmpleado };

    const creando = !empleadoPayload.id;
    if (!empleadoPayload.nombre || !empleadoPayload.especialidad || !empleadoPayload.username) {
      this.errorAccion.set('Completá los campos obligatorios del colaborador.');
      return;
    }

    if (creando && !empleadoPayload.password) {
      this.errorAccion.set('Debes definir una contraseña inicial para el colaborador.');
      return;
    }

    // Mapear los IDs de los servicios seleccionados a objetos de servicio completos
    const serviciosSeleccionados = this.servicios()
      .filter(s => this.serviciosSeleccionados().includes(s.id))
      .map(s => ({ id: s.id, nombre: s.nombre, descripcion: s.descripcion, duracionMinutos: s.duracionMinutos, precio: s.precio, activo: s.activo })); // Mapear a DTO

    empleadoPayload.servicios = serviciosSeleccionados;

    const operacion = empleadoPayload.id
      ? this.empleadoService.actualizarEmpleado(empleadoPayload.id, empleadoPayload)
      : this.empleadoService.crearEmpleado(empleadoPayload);

    operacion.subscribe({
      next: () => {
        this.empleadoService.listarEmpleados(true).subscribe();
        this.cerrarFormEmpleado();
        this.mensaje.set('Colaborador guardado exitosamente.');
      },
      error: (err) => this.errorAccion.set('Error al guardar colaborador: ' + (err.error?.message || err.message))
    });
  }

  toggleEmpleadoActivo(empleado: Empleado): void {
    const empleadoActualizado = { ...empleado, activo: !empleado.activo };
    this.empleadoService.actualizarEmpleado(empleado.id, empleadoActualizado).subscribe({
      next: () => this.empleadoService.listarEmpleados(true).subscribe(),
      error: (err) => this.errorAccion.set('Error al actualizar colaborador: ' + err.message)
    });
  }

  eliminarEmpleado(id: number): void {
    if (!confirm('Â¿EstÃ¡s seguro de eliminar este empleado? Esta acciÃ³n no se puede deshacer.')) return;
    
    this.empleadoService.eliminarEmpleado(id).subscribe({
      next: () => {
        this.empleadoService.listarEmpleados(true).subscribe();
        this.mensaje.set('Colaborador eliminado.');
      },
      error: (err) => this.errorAccion.set('Error al eliminar colaborador: ' + err.message)
    });
  }

  cerrarFormEmpleado(): void {
    this.mostrarFormEmpleado.set(false);
    this.empleadoEditando.set(null);
  }

  // ========== SERVICIOS ==========
  abrirFormServicio(servicio?: Servicio): void {
    this.mostrarFormEmpleado.set(false);
    this.mostrarDetalleTurno.set(false);

    if (servicio) {
      this.servicioEditando.set({ ...servicio });
    } else {
      this.servicioEditando.set(null);
      this.nuevoServicio = {
        id: 0,
        nombre: '',
        descripcion: '',
        duracionMinutos: 30,
        precio: 5000,
        activo: true
      };
    }
    this.mostrarFormServicio.set(true);
  }

  guardarServicio(): void {
    this.mensaje.set(null);
    this.errorAccion.set(null);
    const servicio = this.servicioEditando() || this.nuevoServicio;
    
    if (!servicio.nombre || servicio.precio <= 0) {
      this.errorAccion.set('Completá los campos obligatorios del servicio.');
      return;
    }

    const operacion = servicio.id 
      ? this.servicioService.actualizarServicio(servicio.id, servicio)
      : this.servicioService.crearServicio(servicio);

    operacion.subscribe({
      next: () => {
        this.servicioService.listarServicios().subscribe();
        this.cerrarFormServicio();
        this.mensaje.set('Servicio guardado exitosamente.');
      },
      error: (err) => this.errorAccion.set('Error al guardar servicio: ' + (err.error?.message || err.message))
    });
  }

  toggleServicioActivo(servicio: Servicio): void {
    const servicioActualizado = { ...servicio, activo: !servicio.activo };
    this.servicioService.actualizarServicio(servicio.id, servicioActualizado).subscribe({
      next: () => this.servicioService.listarServicios().subscribe(),
      error: (err) => this.errorAccion.set('Error al actualizar servicio: ' + err.message)
    });
  }

  eliminarServicio(id: number): void {
    if (!confirm('Â¿EstÃ¡s seguro de eliminar este servicio? Esta acciÃ³n no se puede deshacer.')) return;
    
    this.servicioService.eliminarServicio(id).subscribe({
      next: () => {
        this.servicioService.listarServicios().subscribe();
        this.mensaje.set('Servicio eliminado.');
      },
      error: (err) => this.errorAccion.set('Error al eliminar servicio: ' + err.message)
    });
  }

  cerrarFormServicio(): void {
    this.mostrarFormServicio.set(false);
    this.servicioEditando.set(null);
  }

  // ========== TURNOS ==========
  verDetalleTurno(turno: Turno): void {
    this.mostrarFormEmpleado.set(false);
    this.mostrarFormServicio.set(false);
    this.turnoSeleccionado.set(turno);
    this.mostrarDetalleTurno.set(true);
  }

  cerrarDetalleTurno(): void {
    this.mostrarDetalleTurno.set(false);
    this.turnoSeleccionado.set(null);
  }

  turnosFiltrados(): Turno[] {
    const colaboradorId = this.colaboradorTurnosSeleccionado();
    const estadoSeleccionado = this.estadoTurnosSeleccionado();
    const turnos = this.turnos();

    return turnos
      .filter(turno => {
        if (!colaboradorId) {
          return true;
        }
        return String(turno.empleadoId) === colaboradorId;
      })
      .filter(turno => {
        if (!estadoSeleccionado) {
          return true;
        }
        return turno.estado === estadoSeleccionado;
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fechaHoraInicio).getTime();
        const fechaB = new Date(b.fechaHoraInicio).getTime();
        return fechaA - fechaB;
      });
  }

  limpiarFiltroColaboradorTurnos(): void {
    this.colaboradorTurnosSeleccionado.set('');
    this.estadoTurnosSeleccionado.set('');
  }

  estadosTurnoDisponibles(): string[] {
    return ['RESERVADO', 'CONFIRMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO', 'NO_ASISTIO'];
  }

  // ========== ESTADÃSTICAS ==========
  calcularEstadisticas(): void {
    const turnos = this.turnos();
    
    // Crear fechas correctamente desde los strings del input
    const [anioInicio, mesInicio, diaInicio] = this.fechaInicio().split('-').map(Number);
    const inicio = new Date(anioInicio, mesInicio - 1, diaInicio, 0, 0, 0, 0);
    
    const [anioFin, mesFin, diaFin] = this.fechaFin().split('-').map(Number);
    const fin = new Date(anioFin, mesFin - 1, diaFin, 23, 59, 59, 999);
    
    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const finHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);

    let turnosHoy = 0;
    let turnosEnRango = 0;
    let ingresos = 0;
    const clientesUnicos = new Set<string>();

    turnos.forEach(turno => {
      const fechaTurno = new Date(turno.fechaHoraInicio);
      
      // Contar turnos de hoy
      if (fechaTurno >= inicioHoy && fechaTurno <= finHoy) {
        turnosHoy++;
      }
      
      // Contar turnos en el rango seleccionado
      if (fechaTurno >= inicio && fechaTurno <= fin) {
        turnosEnRango++;
        
        // Calcular ingresos solo de turnos finalizados
        if (turno.estado === 'FINALIZADO') {
          ingresos += Number(turno.servicioPrecio || 0);
        }
        
        // Contar clientes Ãºnicos
        if (turno.clienteTelefono) {
          clientesUnicos.add(turno.clienteTelefono);
        }
      }
    });

    this.estadisticas.set({
      turnosHoy,
      turnosSemana: turnosEnRango, // Ahora representa turnos en rango
      turnosMes: turnosEnRango,
      ingresos,
      clientesNuevos: clientesUnicos.size
    });
  }

  // MÃ©todo para actualizar el rango y recalcular
  actualizarRango(): void {
    this.cargarTurnosRango();
  }

  cargarTurnosRango(): void {
    // Crear fechas correctamente desde los strings del input
    const [anioInicio, mesInicio, diaInicio] = this.fechaInicio().split('-').map(Number);
    const inicio = new Date(anioInicio, mesInicio - 1, diaInicio, 0, 0, 0, 0);
    
    const [anioFin, mesFin, diaFin] = this.fechaFin().split('-').map(Number);
    const fin = new Date(anioFin, mesFin - 1, diaFin, 23, 59, 59, 999);
    
    this.turnoService.listarTurnos(inicio, fin).subscribe({
      next: () => {
        // PequeÃ±o delay para asegurar que el signal se actualice
        setTimeout(() => this.calcularEstadisticas(), 100);
      }
    });
  }

  // ========== NAVEGACIÃ“N ==========

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // ============= GESTIÃ“N DE HORARIOS =============
  
  horarios = signal<HorarioEmpleado[]>([]);
  empleadoHorariosSeleccionado = signal<number | null>(null);
  mostrarFormHorario = signal(false);
  horarioEditando = signal<HorarioEmpleado | null>(null);
  
  diasSemana = [
    { numero: 1, nombre: 'Lunes' },
    { numero: 2, nombre: 'Martes' },
    { numero: 3, nombre: 'Miercoles' },
    { numero: 4, nombre: 'Jueves' },
    { numero: 5, nombre: 'Viernes' },
    { numero: 6, nombre: 'Sabado' },
    { numero: 7, nombre: 'Domingo' }
  ];

  nuevoHorario: HorarioEmpleado = {
    empleadoId: 0,
    diaSemana: 1,
    diaNombre: 'Lunes',
    horaInicio: '09:00',
    horaFin: '18:00',
    activo: true,
    descansoMinutos: 10
  };

  cargarHorariosEmpleado(empleadoId: number): void {
    this.empleadoHorariosSeleccionado.set(empleadoId);
    this.horarioService.listarHorariosEmpleado(empleadoId).subscribe({
      next: (horarios) => this.horarios.set(horarios)
    });
  }

  abrirFormHorario(empleadoId?: number): void {
    this.mostrarFormEmpleado.set(false);
    this.mostrarFormServicio.set(false);
    this.mostrarDetalleTurno.set(false);

    if (empleadoId) {
      this.nuevoHorario.empleadoId = empleadoId;
    } else if (this.empleadoHorariosSeleccionado()) {
      this.nuevoHorario.empleadoId = this.empleadoHorariosSeleccionado()!;
    } else {
      this.errorAccion.set('Selecciona un colaborador para crear horarios.');
      return;
    }
    
    this.horarioEditando.set(null);
    this.nuevoHorario = {
      empleadoId: this.nuevoHorario.empleadoId,
      diaSemana: 1,
      diaNombre: 'Lunes',
      horaInicio: '09:00',
      horaFin: '18:00',
      activo: true,
      descansoMinutos: 10
    };
    this.mostrarFormHorario.set(true);
  }

  editarHorario(horario: HorarioEmpleado): void {
    this.horarioEditando.set(horario);
    this.nuevoHorario = { ...horario };
    this.mostrarFormHorario.set(true);
  }

  guardarHorario(): void {
    const empleadoId = this.nuevoHorario.empleadoId;
    if (!empleadoId) {
      this.errorAccion.set('Selecciona un colaborador antes de guardar.');
      return;
    }
    
    if (this.horarioEditando()) {
      // Actualizar
      this.horarioService.actualizarHorario(
        empleadoId, 
        this.horarioEditando()!.id!, 
        this.nuevoHorario
      ).subscribe({
        next: () => {
          this.cargarHorariosEmpleado(empleadoId);
          this.cerrarFormHorario();
        }
      });
    } else {
      // Crear
      this.horarioService.crearHorario(empleadoId, this.nuevoHorario).subscribe({
        next: () => {
          this.cargarHorariosEmpleado(empleadoId);
          this.cerrarFormHorario();
        }
      });
    }
  }

  eliminarHorario(horario: HorarioEmpleado): void {
    if (confirm(`Â¿Eliminar horario de ${horario.diaNombre}?`)) {
      this.horarioService.eliminarHorario(horario.empleadoId, horario.id!).subscribe({
        next: () => this.cargarHorariosEmpleado(horario.empleadoId)
      });
    }
  }

  cerrarFormHorario(): void {
    this.mostrarFormHorario.set(false);
    this.horarioEditando.set(null);
  }

  actualizarDiaNombre(): void {
    const dia = this.diasSemana.find(d => d.numero === this.nuevoHorario.diaSemana);
    if (dia) {
      this.nuevoHorario.diaNombre = dia.nombre;
    }
  }

  seleccionarEmpleadoHorarios(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const empleadoId = Number(select.value);

    if (!empleadoId) {
      this.empleadoHorariosSeleccionado.set(null);
      this.horarios.set([]);
      this.cerrarFormHorario();
      return;
    }

    this.cargarHorariosEmpleado(empleadoId);
    this.cerrarFormHorario();
  }

  // ============= FIN GESTIÃ“N DE HORARIOS =============

  // Utilidades
  formatearPrecio(precio: number | string): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(Number(precio));
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: Record<string, string> = {
      'RESERVADO': 'badge-reservado',
      'CONFIRMADO': 'badge-confirmado',
      'EN_CURSO': 'badge-encurso',
      'FINALIZADO': 'badge-finalizado',
      'CANCELADO': 'badge-cancelado',
      'NO_ASISTIO': 'badge-noasistio'
    };
    return clases[estado] || '';
  }

  getTabNameFromIndex(index: number): 'empleados' | 'servicios' | 'turnos' | 'horarios' | 'stock' | 'asistencia' | 'estadisticas' {
    const tabs: ('estadisticas' | 'turnos' | 'empleados' | 'servicios' | 'horarios' | 'stock' | 'asistencia')[] = ['estadisticas', 'turnos', 'empleados', 'servicios', 'horarios', 'stock', 'asistencia'];
    return tabs[index] || 'estadisticas';
  }

  getTabIndex(tab: 'empleados' | 'servicios' | 'turnos' | 'horarios' | 'stock' | 'asistencia' | 'estadisticas'): number {
    const tabs: ('estadisticas' | 'turnos' | 'empleados' | 'servicios' | 'horarios' | 'stock' | 'asistencia')[] = ['estadisticas', 'turnos', 'empleados', 'servicios', 'horarios', 'stock', 'asistencia'];
    const idx = tabs.indexOf(tab);
    return idx >= 0 ? idx : 0;
  }
}
