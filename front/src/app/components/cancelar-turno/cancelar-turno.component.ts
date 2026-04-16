import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CancelarTurnoRequest } from '../../models/models';
import { TurnoService } from '../../services/turno.service';

@Component({
  selector: 'app-cancelar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cancelar-container">
      <div class="cancelar-card">
        <h1>❌ Cancelar Turno</h1>
        <p class="descripcion">
          Tu código de cancelación se tomó automáticamente desde el enlace. Solo necesitás indicar el motivo.
        </p>

        @if (!cancelado()) {
          <form (ngSubmit)="cancelar()" #form="ngForm">
            <div class="form-group">
              <label>Motivo (opcional)</label>
              <textarea
                [(ngModel)]="request.motivo"
                name="motivo"
                placeholder="Dejanos saber por qué cancelás..."
                rows="3"
                [disabled]="procesando()"
              ></textarea>
            </div>

            @if (error()) {
              <div class="error-message">
                {{ error() }}
              </div>
            }

            <div class="acciones">
              <button
                type="submit"
                class="btn-cancelar"
                [disabled]="procesando() || !codigoCancelacionUrl()"
              >
                @if (procesando()) {
                  Cancelando...
                } @else {
                  Cancelar Turno
                }
              </button>

              <button
                type="button"
                class="btn-volver"
                (click)="volver()"
                [disabled]="procesando()"
              >
                Volver
              </button>
            </div>
          </form>
        } @else {
          <div class="exito">
            <div class="icono-exito">✅</div>
            <h2>Turno Cancelado</h2>
            <p>Tu turno ha sido cancelado exitosamente.</p>
            <p class="info-turno">
              <strong>{{ turnoCancelado()?.clienteNombre }}</strong><br>
              {{ turnoCancelado()?.servicioNombre }}<br>
              {{ turnoCancelado()?.fechaHoraInicio | date:'fullDate':'':'es-AR' }}<br>
              {{ turnoCancelado()?.fechaHoraInicio | date:'HH:mm' }}
            </p>
            <button class="btn-volver" (click)="volver()">
              Volver al Inicio
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cancelar-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .cancelar-card {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    h1 {
      text-align: center;
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 2rem;
    }

    .descripcion {
      text-align: center;
      color: #666;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group input:disabled,
    .form-group textarea:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }

    .form-group small {
      display: block;
      color: #999;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border-left: 4px solid #c62828;
    }

    .acciones {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    button {
      flex: 1;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-cancelar {
      background: #f44336;
      color: white;
    }

    .btn-cancelar:hover:not(:disabled) {
      background: #d32f2f;
      transform: translateY(-2px);
    }

    .btn-volver {
      background: #e0e0e0;
      color: #333;
    }

    .btn-volver:hover:not(:disabled) {
      background: #d0d0d0;
    }

    .exito {
      text-align: center;
    }

    .icono-exito {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .exito h2 {
      color: #4caf50;
      margin: 1rem 0;
    }

    .exito p {
      color: #666;
      margin: 0.5rem 0;
    }

    .info-turno {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      margin: 1.5rem 0;
    }

    @media (max-width: 768px) {
      .cancelar-card {
        padding: 2rem 1.5rem;
      }

      .acciones {
        flex-direction: column;
      }
    }
  `]
})
export class CancelarTurnoComponent {
  private turnoService = inject(TurnoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  request: CancelarTurnoRequest = {
    codigoCancelacion: '',
    motivo: ''
  };

  codigoCancelacionUrl = signal('');
  procesando = signal(false);
  error = signal<string | null>(null);
  cancelado = signal(false);
  turnoCancelado = signal<any>(null);

  constructor() {
    const codigo = this.route.snapshot.queryParamMap.get('codigo')?.trim() || '';
    this.codigoCancelacionUrl.set(codigo);
    this.request.codigoCancelacion = codigo;
  }

  cancelar() {
    if (!this.codigoCancelacionUrl()) {
      this.error.set('El enlace de cancelación es inválido o no contiene código.');
      return;
    }

    this.procesando.set(true);
    this.error.set(null);

    this.turnoService.cancelarTurnoPublico(this.request).subscribe({
      next: (turno) => {
        this.cancelado.set(true);
        this.turnoCancelado.set(turno);
        this.procesando.set(false);
      },
      error: (err) => {
        this.error.set(
          err.error?.message || 
          'No se pudo cancelar el turno. Verificá que el enlace sea válido.'
        );
        this.procesando.set(false);
      }
    });
  }

  volver() {
    this.router.navigate(['/']);
  }
}
