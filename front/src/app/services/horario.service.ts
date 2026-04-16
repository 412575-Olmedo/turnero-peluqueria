import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../env/environment';
import { HorarioEmpleado } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class HorarioService {
  private apiUrl = `${environment.apiUrl}/empleados`;
  
  horarios = signal<HorarioEmpleado[]>([]);

  constructor(private http: HttpClient) {}

  listarHorariosEmpleado(empleadoId: number): Observable<HorarioEmpleado[]> {
    return this.http.get<HorarioEmpleado[]>(`${this.apiUrl}/${empleadoId}/horarios`).pipe(
      tap(horarios => this.horarios.set(horarios))
    );
  }

  listarHorariosActivos(empleadoId: number): Observable<HorarioEmpleado[]> {
    return this.http.get<HorarioEmpleado[]>(`${this.apiUrl}/${empleadoId}/horarios/activos`);
  }

  crearHorario(empleadoId: number, horario: HorarioEmpleado): Observable<HorarioEmpleado> {
    return this.http.post<HorarioEmpleado>(`${this.apiUrl}/${empleadoId}/horarios`, horario);
  }

  actualizarHorario(empleadoId: number, horarioId: number, horario: HorarioEmpleado): Observable<HorarioEmpleado> {
    return this.http.put<HorarioEmpleado>(`${this.apiUrl}/${empleadoId}/horarios/${horarioId}`, horario);
  }

  eliminarHorario(empleadoId: number, horarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${empleadoId}/horarios/${horarioId}`);
  }
}
