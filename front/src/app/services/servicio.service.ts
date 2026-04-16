import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../env/environment';
import { Servicio } from '../models/models';
import { SucursalService } from './sucursal.service';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private http = inject(HttpClient);
  private sucursalService = inject(SucursalService);
  private apiUrl = `${environment.apiUrl}/servicios`;

  // Signal para manejar la lista de servicios
  servicios = signal<Servicio[]>([]);

  // Método para obtener el signal de servicios
  getServicios() {
    return this.servicios;
  }

  listarServicios(): Observable<Servicio[]> {
    let params = new HttpParams();
    const sucursalId = this.sucursalService.getSucursalActualId();
    if (sucursalId) {
      params = params.set('sucursalId', sucursalId.toString());
    }
    return this.http.get<Servicio[]>(this.apiUrl, { params }).pipe(
      tap(servicios => this.servicios.set(servicios))
    );
  }

  obtenerServicio(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.apiUrl}/${id}`);
  }

  crearServicio(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(this.apiUrl, servicio);
  }

  actualizarServicio(id: number, servicio: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.apiUrl}/${id}`, servicio);
  }

  eliminarServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
