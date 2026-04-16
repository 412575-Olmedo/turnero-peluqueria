import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../env/environment';
import { CancelarTurnoRequest, DisponibilidadResponse, EstadoTurno, SlotsDelDia, Turno, TurnoRequest } from '../models/models';
import { AuthService } from './auth.service';

/**
 * Servicio de turnos usando Signals
 * Maneja el estado de la lista de turnos de forma reactiva
 */
@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/turnos`;

  // Signals para manejar el estado de los turnos
  turnos = signal<Turno[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  crearTurno(turnoRequest: TurnoRequest): Observable<Turno> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<Turno>(this.apiUrl, turnoRequest, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap({
        next: (turno) => {
          // Actualizar la lista de turnos agregando el nuevo
          this.turnos.update(turnos => [...turnos, turno]);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error.error?.message || 'Error al crear el turno');
          this.loading.set(false);
        }
      })
    );
  }

  obtenerTurno(id: number): Observable<Turno> {
    return this.http.get<Turno>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  listarTurnos(inicio: Date, fin: Date): Observable<Turno[]> {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams()
      .set('inicio', inicio.toISOString())
      .set('fin', fin.toISOString());

    return this.http.get<Turno[]>(this.apiUrl, { params }).pipe(
      tap({
        next: (turnos) => {
          this.turnos.set(turnos);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error.error?.message || 'Error al cargar turnos');
          this.loading.set(false);
        }
      })
    );
  }

  listarTurnosPorEmpleado(empleadoId: number, inicio: Date, fin: Date): Observable<Turno[]> {
    const params = new HttpParams()
      .set('inicio', inicio.toISOString())
      .set('fin', fin.toISOString());

    return this.http.get<Turno[]>(`${this.apiUrl}/empleado/${empleadoId}`, { params });
  }

  consultarDisponibilidad(empleadoId: number, fecha: Date, servicioId: number): Observable<DisponibilidadResponse> {
    const fechaStr = fecha.toISOString().split('T')[0];
    const params = new HttpParams()
      .set('empleadoId', empleadoId.toString())
      .set('fecha', fechaStr)
      .set('servicioId', servicioId.toString());

    return this.http.get<DisponibilidadResponse>(`${this.apiUrl}/disponibilidad`, { params });
  }

  cancelarTurno(id: number, motivo: string): Observable<Turno> {
    const params = new HttpParams().set('motivo', motivo);

    return this.http.put<Turno>(`${this.apiUrl}/${id}/cancelar`, null, {
      params,
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(turnoActualizado => {
        // Actualizar el turno en la lista
        this.turnos.update(turnos =>
          turnos.map(t => t.id === id ? turnoActualizado : t)
        );
      })
    );
  }

  descargarComprobante(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/comprobante`, {
      responseType: 'blob'
    });
  }

  // Nuevos métodos para funcionalidades avanzadas

  obtenerSlotsDisponibles(empleadoId: number, fecha: Date, servicioId: number): Observable<SlotsDelDia> {
    const fechaStr = fecha.toISOString().split('T')[0];
    const params = new HttpParams()
      .set('empleadoId', empleadoId.toString())
      .set('fecha', fechaStr)
      .set('servicioId', servicioId.toString());

    return this.http.get<SlotsDelDia>(`${this.apiUrl}/slots-disponibles`, { params });
  }

  obtenerTurnosDelDia(empleadoId: number, fecha?: Date): Observable<Turno[]> {
    const fechaStr = fecha ? fecha.toISOString().split('T')[0] : undefined;
    const params = fechaStr ? new HttpParams().set('fecha', fechaStr) : new HttpParams();

    return this.http.get<Turno[]>(`${this.apiUrl}/del-dia/empleado/${empleadoId}`, { params });
  }

  obtenerTodosLosTurnosDelDia(fecha?: Date): Observable<Turno[]> {
    const fechaStr = fecha ? fecha.toISOString().split('T')[0] : undefined;
    const params = fechaStr ? new HttpParams().set('fecha', fechaStr) : new HttpParams();

    return this.http.get<Turno[]>(`${this.apiUrl}/del-dia`, { params });
  }

  cancelarTurnoPublico(request: CancelarTurnoRequest): Observable<Turno> {
    return this.http.post<Turno>(`${this.apiUrl}/cancelar-publico`, request);
  }

  cambiarEstadoTurno(id: number, estado: EstadoTurno, observaciones?: string): Observable<Turno> {
    let params = new HttpParams().set('estado', estado);
    if (observaciones) {
      params = params.set('observaciones', observaciones);
    }

    return this.http.put<Turno>(`${this.apiUrl}/${id}/cambiar-estado`, null, {
      params,
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(turnoActualizado => {
        this.turnos.update(turnos =>
          turnos.map(t => t.id === id ? turnoActualizado : t)
        );
      })
    );
  }

  /**
   * Obtiene los turnos del empleado autenticado
   * Requiere token JWT válido
   */
  obtenerMisTurnos(fecha?: Date): Observable<Turno[]> {
    const fechaStr = fecha ? fecha.toISOString().split('T')[0] : undefined;
    const params = fechaStr ? new HttpParams().set('fecha', fechaStr) : new HttpParams();

    return this.http.get<Turno[]>(`${this.apiUrl}/mis-turnos`, {
      params,
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Carga los turnos del empleado autenticado y actualiza los signals del servicio.
   */
  cargarMisTurnos(fecha?: Date): Observable<Turno[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.obtenerMisTurnos(fecha).pipe(
      tap({
        next: (turnos) => {
          this.turnos.set(turnos || []);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error?.error?.message || 'No se pudieron cargar los turnos');
          this.loading.set(false);
        }
      })
    );
  }
}
