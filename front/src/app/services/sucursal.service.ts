import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../env/environment';
import { Sucursal } from '../models/models';

/**
 * Servicio para gestión de sucursales
 */
@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private apiUrl = `${environment.apiUrl}/sucursales`;
  
  // Estado global de la sucursal seleccionada
  sucursalActual = signal<Sucursal | null>(null);
  sucursales = signal<Sucursal[]>([]);
  // Signal para forzar cambios cuando se selecciona la misma sucursal
  private sucursalCambio = signal<number>(0);

  constructor(private http: HttpClient) {
    this.cargarSucursalGuardada();
    this.cargarSucursales();
  }

  /**
   * Carga la sucursal guardada en localStorage
   */
  private cargarSucursalGuardada(): void {
    const sucursalGuardada = localStorage.getItem('sucursalActual');
    if (sucursalGuardada) {
      try {
        this.sucursalActual.set(JSON.parse(sucursalGuardada));
      } catch (error) {
        console.error('Error al cargar sucursal guardada:', error);
      }
    }
  }

  /**
   * Establece la sucursal actual
   */
  setSucursalActual(sucursal: Sucursal): void {
    // Crear una copia para forzar detección de cambios
    this.sucursalActual.set({ ...sucursal });
    localStorage.setItem('sucursalActual', JSON.stringify(sucursal));
    // Incrementar contador para forzar effects
    this.sucursalCambio.update(v => v + 1);
  }

  /**
   * Obtiene el signal de cambio para effects
   */
  getCambioSignal() {
    return this.sucursalCambio;
  }

  /**
   * Obtiene el ID de la sucursal actual
   */
  getSucursalActualId(): number | null {
    return this.sucursalActual()?.id || null;
  }

  /**
   * Lista todas las sucursales
   */
  listarTodas(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(this.apiUrl).pipe(
      tap(sucursales => this.sucursales.set(sucursales))
    );
  }

  /**
   * Lista sucursales activas
   */
  listarActivas(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(`${this.apiUrl}/activas`).pipe(
      tap(sucursales => this.sucursales.set(sucursales))
    );
  }

  /**
   * Obtiene una sucursal por ID
   */
  obtenerPorId(id: number): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva sucursal
   */
  crear(sucursal: Sucursal): Observable<Sucursal> {
    return this.http.post<Sucursal>(this.apiUrl, sucursal).pipe(
      tap(() => this.cargarSucursales())
    );
  }

  /**
   * Actualiza una sucursal
   */
  actualizar(id: number, sucursal: Sucursal): Observable<Sucursal> {
    return this.http.put<Sucursal>(`${this.apiUrl}/${id}`, sucursal).pipe(
      tap(() => this.cargarSucursales())
    );
  }

  /**
   * Desactiva una sucursal
   */
  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/desactivar`, {}).pipe(
      tap(() => this.cargarSucursales())
    );
  }

  /**
   * Activa una sucursal
   */
  activar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/activar`, {}).pipe(
      tap(() => this.cargarSucursales())
    );
  }

  /**
   * Busca sucursales por localidad
   */
  buscarPorLocalidad(localidad: string): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(`${this.apiUrl}/buscar/localidad`, {
      params: { localidad }
    });
  }

  /**
   * Busca sucursales por provincia
   */
  buscarPorProvincia(provincia: string): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(`${this.apiUrl}/buscar/provincia`, {
      params: { provincia }
    });
  }

  /**
   * Carga las sucursales en el signal
   */
  private cargarSucursales(): void {
    this.listarActivas().subscribe();
  }
}
