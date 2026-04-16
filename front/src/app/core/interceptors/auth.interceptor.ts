import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

/**
 * Interceptor HTTP funcional que agrega automáticamente el token JWT
 * a todas las peticiones salientes (excepto login/register).
 * 
 * Si el usuario está autenticado, agrega el header:
 * Authorization: Bearer <token>
 */
export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.token();

  // No agregar token a las rutas de autenticación
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Si hay token, agregarlo al header
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
