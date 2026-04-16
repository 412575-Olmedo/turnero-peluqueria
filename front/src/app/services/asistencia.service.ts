import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../env/environment';
import {
    JornadaActual,
    JornadaTrabajo,
    MarcarPagadoRequest,
    ResumenMensual
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private apiUrl = `${environment.apiUrl}/asistencia`;

  // Signals para estado reactivo
  jornadaActual = signal<JornadaActual>({ trabajando: false });
  historial = signal<JornadaTrabajo[]>([]);
  resumenMensual = signal<ResumenMensual | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Marca la entrada del empleado
   */
  marcarEntrada(): Observable<JornadaTrabajo> {
    return this.http.post<JornadaTrabajo>(`${this.apiUrl}/marcar-entrada`, {}).pipe(
      tap(() => this.actualizarJornadaActual())
    );
  }

  /**
   * Marca la salida del empleado
   */
  marcarSalida(): Observable<JornadaTrabajo> {
    return this.http.post<JornadaTrabajo>(`${this.apiUrl}/marcar-salida`, {}).pipe(
      tap(() => this.actualizarJornadaActual())
    );
  }

  /**
   * Obtiene el estado actual de la jornada
   */
  obtenerJornadaActual(): Observable<JornadaActual> {
    return this.http.get<JornadaActual>(`${this.apiUrl}/jornada-actual`).pipe(
      tap(estado => this.jornadaActual.set(estado))
    );
  }

  /**
   * Actualiza el estado de la jornada actual (para usar después de marcar entrada/salida)
   */
  actualizarJornadaActual(): void {
    this.obtenerJornadaActual().subscribe();
  }

  /**
   * Obtiene el historial de jornadas del mes
   */
  obtenerHistorial(mes?: number, anio?: number): Observable<JornadaTrabajo[]> {
    let url = `${this.apiUrl}/historial`;
    const params: string[] = [];
    
    if (mes) params.push(`mes=${mes}`);
    if (anio) params.push(`anio=${anio}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<JornadaTrabajo[]>(url).pipe(
      tap(jornadas => this.historial.set(jornadas))
    );
  }

  /**
   * Obtiene el resumen mensual
   */
  obtenerResumenMensual(mes?: number, anio?: number): Observable<ResumenMensual> {
    let url = `${this.apiUrl}/resumen-mensual`;
    const params: string[] = [];
    
    if (mes) params.push(`mes=${mes}`);
    if (anio) params.push(`anio=${anio}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<ResumenMensual>(url).pipe(
      tap(resumen => this.resumenMensual.set(resumen))
    );
  }

  /**
   * ADMIN: Obtiene jornadas de una fecha específica
   */
  obtenerJornadasDelDia(fecha?: string): Observable<JornadaTrabajo[]> {
    let url = `${this.apiUrl}/dia`;
    if (fecha) {
      url += `?fecha=${fecha}`;
    }
    return this.http.get<JornadaTrabajo[]>(url);
  }

  /**
   * ADMIN: Obtiene todas las jornadas abiertas
   */
  obtenerJornadasAbiertas(): Observable<JornadaTrabajo[]> {
    return this.http.get<JornadaTrabajo[]>(`${this.apiUrl}/abiertas`);
  }

  /**
   * ADMIN: Obtiene historial de un empleado específico
   */
  obtenerHistorialEmpleado(empleadoId: number, mes?: number, anio?: number): Observable<JornadaTrabajo[]> {
    let url = `${this.apiUrl}/empleado/${empleadoId}/historial`;
    const params: string[] = [];
    
    if (mes) params.push(`mes=${mes}`);
    if (anio) params.push(`anio=${anio}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<JornadaTrabajo[]>(url);
  }

  /**
   * ADMIN: Obtiene resumen de un empleado específico
   */
  obtenerResumenEmpleado(empleadoId: number, mes?: number, anio?: number): Observable<ResumenMensual> {
    let url = `${this.apiUrl}/empleado/${empleadoId}/resumen`;
    const params: string[] = [];
    
    if (mes) params.push(`mes=${mes}`);
    if (anio) params.push(`anio=${anio}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<ResumenMensual>(url);
  }

  /**
   * ADMIN: Marca jornadas como pagadas
   */
  marcarComoPagado(request: MarcarPagadoRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/marcar-pagado`, request);
  }

  /**
   * Formatea una fecha ISO a hora legible (HH:mm)
   */
  formatearHora(fechaHora?: string): string {
    if (!fechaHora) return '-';
    const fecha = new Date(fechaHora);
    return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Formatea una fecha ISO a fecha legible (DD/MM/YYYY)
   */
  formatearFecha(fecha?: string): string {
    if (!fecha) return '-';
    const f = new Date(fecha);
    return f.toLocaleDateString('es-AR');
  }

  /**
   * Calcula el monto estimado basado en minutos trabajados y precio/hora
   */
  calcularMontoEstimado(minutos: number, precioHora: number): number {
    const horas = minutos / 60;
    return horas * precioHora;
  }
}
