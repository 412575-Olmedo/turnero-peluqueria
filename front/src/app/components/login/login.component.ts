import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Componente de login
 * Usa Signals para manejar el estado del formulario
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo-container">
          <img src="/logo.jpeg" alt="Cortarte Estilistas" class="logo">
        </div>
        
        @if (error()) {
          <div class="error-message">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="login()">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              type="text" 
              id="username" 
              [(ngModel)]="username"
              name="username"
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password"
              name="password"
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <button type="submit" class="btn-login" [disabled]="loading()">
            {{ loading() ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div class="demo-info">
          <p><strong>Admin:</strong> admin / password</p>
          <p><strong>Colaborador:</strong> carlos / password</p>
          <p><strong>Cliente:</strong> cliente1 / password</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .logo {
      width: 200px;
      height: 200px;
      object-fit: contain;
      border-radius: 12px;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 2rem;
      font-size: 0.9rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 600;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-login {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      background: #fee;
      color: #c33;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .demo-info {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 0.85rem;
      color: #666;
    }

    .demo-info p {
      margin: 0.5rem 0;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  login(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: (response) => {
          // Redirigir según el rol del usuario
          if (response.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (response.role === 'EMPLEADO') {
            this.router.navigate(['/empleado']);
          } else {
            this.router.navigate(['/calendario']);
          }
        },
        error: (err) => {
          this.error.set('Usuario o contraseña incorrectos');
          this.loading.set(false);
        }
      });
  }
}
