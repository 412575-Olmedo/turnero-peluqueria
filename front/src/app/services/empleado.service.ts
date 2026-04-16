import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../env/environment';
import { Empleado } from '../models/models';
import { SucursalService } from './sucursal.service';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private http = inject(HttpClient);
  private sucursalService = inject(SucursalService);
  private apiUrl = `${environment.apiUrl}/empleados`;

  // Signal para manejar la lista de empleados
  empleados = signal<Empleado[]>([]);

  // Método para obtener el signal de empleados
  getEmpleados() {
    return this.empleados;
  }

  listarEmpleados(incluirInactivos = false): Observable<Empleado[]> {
    let params = new HttpParams();
    const sucursalId = this.sucursalService.getSucursalActualId();
    if (sucursalId) {
      params = params.set('sucursalId', sucursalId.toString());
    }
    if (incluirInactivos) {
      params = params.set('incluirInactivos', 'true');
    }
    return this.http.get<Empleado[]>(this.apiUrl, { params }).pipe(
      tap(empleados => this.empleados.set(empleados))
    );
  }

  obtenerEmpleado(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.apiUrl}/${id}`);
  }

  obtenerEmpleadoPorUsername(username: string): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.apiUrl}/por-usuario/${username}`);
  }

  crearEmpleado(empleado: Empleado): Observable<Empleado> {
    const sucursalId = this.sucursalService.getSucursalActualId();
    const payload: Empleado = {
      ...empleado,
      sucursalId: empleado.sucursalId ?? sucursalId ?? undefined
    };
    return this.http.post<Empleado>(this.apiUrl, payload);
  }

  actualizarEmpleado(id: number, empleado: Empleado): Observable<Empleado> {
    const sucursalId = this.sucursalService.getSucursalActualId();
    const payload: Empleado = {
      ...empleado,
      sucursalId: empleado.sucursalId ?? sucursalId ?? undefined
    };
    return this.http.put<Empleado>(`${this.apiUrl}/${id}`, payload);
  }

  eliminarEmpleado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
