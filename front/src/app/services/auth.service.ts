import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../env/environment';
import { AuthResponse, LoginRequest } from '../models/models';

/**
 * Servicio de autenticación usando Signals
 * Gestiona el token JWT y el estado del usuario
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals para manejar el estado de autenticación
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<AuthResponse | null>(null);
  token = signal<string | null>(null);
  role = signal<string | null>(null);

  constructor() {
    // Verificar si hay un token guardado al iniciar
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('role');
    
    if (savedToken && savedUser) {
      this.token.set(savedToken);
      this.currentUser.set(JSON.parse(savedUser));
      this.role.set(savedRole || null);
      this.isAuthenticated.set(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.token.set(response.token);
        this.currentUser.set(response);
        this.role.set(response.role);
        this.isAuthenticated.set(true);
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        localStorage.setItem('role', response.role);
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.role.set(null);
    this.isAuthenticated.set(false);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }

  getAuthHeaders(): HttpHeaders {
    const tokenValue = this.token();
    return new HttpHeaders({
      'Authorization': `Bearer ${tokenValue}`
    });
  }

  getRole(): string | null {
    return this.role();
  }

  isAdmin(): boolean {
    return this.role() === 'ADMIN';
  }

  isEmpleado(): boolean {
    return this.role() === 'EMPLEADO';
  }
}
