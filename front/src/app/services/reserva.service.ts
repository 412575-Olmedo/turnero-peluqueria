import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../env/environment';
import {
    ClienteInfo,
    DiaDisponibilidad,
    Empleado,
    ReservaState,
    Servicio,
    SlotDisponible,
    SlotsDelDia,
    Turno,
    TurnoRequest
} from '../models/models';
import { SucursalService } from './sucursal.service';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = environment.apiUrl;
  private sucursalService = inject(SucursalService);
  private http = inject(HttpClient);
  
  // Estado reactivo de la reserva
  reservaState = signal<ReservaState>({
    paso: 1
  });

  // ========== GESTIÓN DE ESTADO ==========
  
  actualizarPaso(paso: 1 | 2 | 3) {
    this.reservaState.update(state => ({ ...state, paso }));
  }

  seleccionarServicio(servicio: Servicio) {
    this.reservaState.update(state => ({
      ...state,
      servicioSeleccionado: servicio,
      paso: 2,
      // Resetear selecciones posteriores
      empleadoSeleccionado: undefined,
      fechaSeleccionada: undefined,
      horarioSeleccionado: undefined
    }));
  }

  seleccionarEmpleado(empleado: Empleado | null) {
    this.reservaState.update(state => ({
      ...state,
      empleadoSeleccionado: empleado || undefined,
      paso: 3,
      // Resetear selecciones posteriores
      fechaSeleccionada: undefined,
      horarioSeleccionado: undefined
    }));
  }

  seleccionarFecha(fecha: string) {
    this.reservaState.update(state => ({
      ...state,
      fechaSeleccionada: fecha,
      paso: 3,
      // Resetear horario
      horarioSeleccionado: undefined
    }));
  }

  seleccionarHorario(horario: SlotDisponible) {
    this.reservaState.update(state => ({
      ...state,
      horarioSeleccionado: horario
    }));
  }

  guardarClienteInfo(info: ClienteInfo) {
    this.reservaState.update(state => ({
      ...state,
      clienteInfo: info
    }));
  }

  resetearReserva() {
    this.reservaState.set({ paso: 1 });
  }

  // ========== LLAMADAS API ==========

  /**
   * Obtiene disponibilidad de días para un mes específico
   */
  obtenerDisponibilidadMes(
    servicioId: number,
    empleadoId: number | null,
    mes: number,
    anio: number
  ): Observable<DiaDisponibilidad[]> {
    let params = new HttpParams()
      .set('servicioId', servicioId.toString())
      .set('mes', mes.toString())
      .set('anio', anio.toString());

    if (empleadoId) {
      params = params.set('empleadoId', empleadoId.toString());
    }

    return this.http.get<SlotsDelDia[]>(`${this.apiUrl}/turnos/disponibilidad/mes`, { params })
      .pipe(
        map(slots => this.convertirASlotsADias(slots))
      );
  }

  /**
   * Obtiene slots disponibles para un día específico
   */
  obtenerSlotsDelDia(
    servicioId: number,
    empleadoId: number | null,
    fecha: string
  ): Observable<SlotsDelDia> {
    let params = new HttpParams()
      .set('servicioId', servicioId.toString())
      .set('fecha', fecha);

    if (empleadoId) {
      params = params.set('empleadoId', empleadoId.toString());
    }

    return this.http.get<SlotsDelDia>(`${this.apiUrl}/turnos/disponibilidad/dia`, { params });
  }

  /**
   * Obtiene múltiples empleados que pueden realizar el servicio
   */
  obtenerEmpleadosPorServicio(servicioId: number): Observable<Empleado[]> {
    let params = new HttpParams();
    const sucursalId = this.sucursalService.getSucursalActualId();
    if (sucursalId) {
      params = params.set('sucursalId', sucursalId.toString());
    }
    return this.http.get<Empleado[]>(`${this.apiUrl}/empleados/por-servicio/${servicioId}`, { params });
  }

  /**
   * Crea una reserva de turno
   */
  crearReserva(request: TurnoRequest): Observable<Turno> {
    return this.http.post<Turno>(`${this.apiUrl}/turnos/reservar`, request);
  }

  /**
   * Obtiene próximos horarios disponibles (para botón "Próxima disponibilidad")
   */
  obtenerProximaDisponibilidad(
    servicioId: number,
    empleadoId: number | null,
    cantidad: number = 5
  ): Observable<SlotDisponible[]> {
    let params = new HttpParams()
      .set('servicioId', servicioId.toString())
      .set('cantidad', cantidad.toString());

    if (empleadoId) {
      params = params.set('empleadoId', empleadoId.toString());
    }

    return this.http.get<SlotDisponible[]>(`${this.apiUrl}/turnos/proximos-disponibles`, { params });
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Convierte slots diarios a información de disponibilidad por día
   */
  private convertirASlotsADias(slots: SlotsDelDia[]): DiaDisponibilidad[] {
    const diasMap = new Map<string, DiaDisponibilidad>();

    slots.forEach(slot => {
      if (!diasMap.has(slot.fecha)) {
        const porcentaje = (slot.totalDisponibles / slot.slots.length) * 100;
        let nivel: 'alto' | 'medio' | 'bajo' | 'sin' = 'sin';

        if (porcentaje >= 60) nivel = 'alto';
        else if (porcentaje >= 30) nivel = 'medio';
        else if (porcentaje > 0) nivel = 'bajo';

        diasMap.set(slot.fecha, {
          fecha: slot.fecha,
          disponible: slot.totalDisponibles > 0,
          nivel,
          porcentajeDisponible: porcentaje
        });
      }
    });

    return Array.from(diasMap.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  /**
   * Valida si la reserva actual está completa
   */
  validarReservaCompleta(): boolean {
    const state = this.reservaState();
    return !!(
      state.servicioSeleccionado &&
      state.fechaSeleccionada &&
      state.horarioSeleccionado &&
      state.clienteInfo?.nombre &&
      state.clienteInfo?.telefono
    );
  }

  /**
   * Construye el objeto TurnoRequest desde el estado actual
   */
  construirTurnoRequest(): TurnoRequest | null {
    const state = this.reservaState();
    
    if (!this.validarReservaCompleta()) {
      return null;
    }

    return {
      servicioId: state.servicioSeleccionado!.id,
      empleadoId: state.empleadoSeleccionado?.id || 0, // 0 = cualquier empleado
      fechaHoraInicio: `${state.fechaSeleccionada}T${state.horarioSeleccionado!.horaInicio}`,
      clienteNombre: state.clienteInfo!.nombre,
      clienteTelefono: state.clienteInfo!.telefono,
      clienteEmail: state.clienteInfo!.email
    };
  }
}
