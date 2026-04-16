import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../env/environment';
import { MovimientoStockRequest, Producto, StockMovimiento } from '../models/models';
import { AuthService } from './auth.service';
import { SucursalService } from './sucursal.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private sucursalService = inject(SucursalService);
  private apiUrl = `${environment.apiUrl}/productos`;

  // Signals
  productos = signal<Producto[]>([]);
  productosStockBajo = signal<Producto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  listarProductos(): Observable<Producto[]> {
    this.loading.set(true);
    let params = new HttpParams();
    const sucursalId = this.sucursalService.getSucursalActualId();
    if (sucursalId) {
      params = params.set('sucursalId', sucursalId.toString());
    }

    return this.http.get<Producto[]>(this.apiUrl, {
      params,
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap({
        next: (productos) => {
          this.productos.set(productos);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      })
    );
  }

  listarPorCategoria(categoria: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/categoria/${categoria}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  listarStockBajo(): Observable<Producto[]> {
    let params = new HttpParams();
    const sucursalId = this.sucursalService.getSucursalActualId();
    if (sucursalId) {
      params = params.set('sucursalId', sucursalId.toString());
    }

    return this.http.get<Producto[]>(`${this.apiUrl}/alertas`, {
      params,
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(productos => this.productosStockBajo.set(productos))
    );
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  crearProducto(producto: Producto): Observable<Producto> {
    const sucursalId = this.sucursalService.getSucursalActualId();
    const payload: Producto = {
      ...producto,
      sucursalId: producto.sucursalId ?? sucursalId ?? undefined
    };

    return this.http.post<Producto>(this.apiUrl, payload, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(nuevo => {
        this.productos.update(productos => [...productos, nuevo]);
      })
    );
  }

  actualizarProducto(id: number, producto: Producto): Observable<Producto> {
    const sucursalId = this.sucursalService.getSucursalActualId();
    const payload: Producto = {
      ...producto,
      sucursalId: producto.sucursalId ?? sucursalId ?? undefined
    };

    return this.http.put<Producto>(`${this.apiUrl}/${id}`, payload, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(actualizado => {
        this.productos.update(productos =>
          productos.map(p => p.id === id ? actualizado : p)
        );
      })
    );
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(() => {
        this.productos.update(productos =>
          productos.filter(p => p.id !== id)
        );
      })
    );
  }

  registrarMovimiento(id: number, movimiento: MovimientoStockRequest): Observable<Producto> {
    const usuario = this.authService.currentUser()?.username || 'Sistema';
    const headers = this.authService.getAuthHeaders().append('X-Usuario', usuario);

    return this.http.post<Producto>(`${this.apiUrl}/${id}/movimiento`, movimiento, {
      headers
    }).pipe(
      tap(actualizado => {
        this.productos.update(productos =>
          productos.map(p => p.id === id ? actualizado : p)
        );
      })
    );
  }

  obtenerHistorial(id: number): Observable<StockMovimiento[]> {
    return this.http.get<StockMovimiento[]>(`${this.apiUrl}/${id}/historial`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  obtenerUltimosMovimientos(): Observable<StockMovimiento[]> {
    return this.http.get<StockMovimiento[]>(`${this.apiUrl}/movimientos/recientes`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
