import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadoTurno, Turno } from '../../models/models';
import { EmpleadoService } from '../../services/empleado.service';
import { TurnoService } from '../../services/turno.service';

@Component({
  selector: 'app-turnos-del-dia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="turnos-del-dia-container">
      <header class="header">
        <h1>📅 Turnos del Día</h1>
        <p class="fecha">{{ fechaActual | date:'fullDate':'':'es-AR' }}</p>
      </header>

      <div class="filtros">
        <label>
          Colaborador:
          <select [(ngModel)]="empleadoSeleccionado" (change)="cargarTurnos()">
            <option value="">Todos los colaboradores</option>
            @for (emp of empleados(); track emp.id) {
              <option [value]="emp.id">{{ emp.nombre }}</option>
            }
          </select>
        </label>
      </div>

      <div class="turnos-lista">
        @if (cargando()) {
          <p class="loading">Cargando turnos...</p>
        } @else if (turnos().length === 0) {
          <p class="empty">No hay turnos para hoy</p>
        } @else {
          @for (turno of turnos(); track turno.id) {
            <div class="turno-card" [class]="'estado-' + turno.estado.toLowerCase()">
              <div class="turno-hora">
                <span class="hora">{{ turno.fechaHoraInicio | date:'HH:mm' }}</span>
                <span class="duracion">{{ turno.servicioDuracion }} min</span>
              </div>
              
              <div class="turno-info">
                <h3>{{ turno.clienteNombre }}</h3>
                <p class="servicio">{{ turno.servicioNombre }}</p>
                <p class="empleado">👤 {{ turno.empleadoNombre }}</p>
                <p class="telefono">📞 {{ turno.clienteTelefono }}</p>
              </div>

              <div class="turno-estado">
                <span class="badge" [class]="'badge-' + turno.estado.toLowerCase()">
                  {{ obtenerTextoEstado(turno.estado) }}
                </span>
              </div>

              <div class="turno-acciones">
                @if (turno.estado === 'RESERVADO') {
                  <button (click)="cambiarEstado(turno.id, 'FINALIZADO')" class="btn-finalizar">
                    ✅ Finalizar
                  </button>
                  <button (click)="cambiarEstado(turno.id, 'NO_ASISTIO')" class="btn-no-asistio">
                    👻 No asistió
                  </button>
                  <button (click)="cambiarEstado(turno.id, 'CANCELADO')" class="btn-cancelar">
                    ❌ Cancelar
                  </button>
                }
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .turnos-del-dia-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      color: #667eea;
      margin: 0;
    }

    .fecha {
      color: #666;
      font-size: 1.1rem;
      margin-top: 0.5rem;
    }

    .filtros {
      margin-bottom: 2rem;
      display: flex;
      gap: 1rem;
    }

    .filtros select {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 2px solid #e0e0e0;
      font-size: 1rem;
    }

    .turnos-lista {
      display: grid;
      gap: 1rem;
    }

    .turno-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      gap: 1.5rem;
      align-items: center;
      transition: transform 0.2s;
    }

    .turno-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .turno-hora {
      text-align: center;
    }

    .hora {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
    }

    .duracion {
      font-size: 0.875rem;
      color: #666;
    }

    .turno-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .turno-info p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: #666;
    }

    .badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .badge-reservado { background: #e3f2fd; color: #1976d2; }
    .badge-confirmado { background: #e8f5e9; color: #388e3c; }
    .badge-en_curso { background: #fff3e0; color: #f57c00; }
    .badge-finalizado { background: #e8f5e9; color: #2e7d32; }
    .badge-cancelado { background: #ffebee; color: #c62828; }
    .badge-no_asistio { background: #f5f5f5; color: #757575; }

    .turno-acciones {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .turno-acciones button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: opacity 0.2s;
    }

    .turno-acciones button:hover {
      opacity: 0.8;
    }

    .btn-finalizar {
      background: #4caf50;
      color: white;
    }

    .btn-no-asistio {
      background: #9e9e9e;
      color: white;
    }

    .btn-cancelar {
      background: #f44336;
      color: white;
    }

    .loading, .empty {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .turno-card {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .turno-acciones {
        flex-direction: row;
        justify-content: center;
      }
    }
  `]
})
export class TurnosDelDiaComponent implements OnInit {
  private turnoService = inject(TurnoService);
  private empleadoService = inject(EmpleadoService);

  turnos = signal<Turno[]>([]);
  empleados = this.empleadoService.empleados;
  cargando = signal(false);
  empleadoSeleccionado = '';
  fechaActual = new Date();

  ngOnInit() {
    this.empleadoService.listarEmpleados().subscribe();
    this.cargarTurnos();
  }

  cargarTurnos() {
    this.cargando.set(true);
    
    const obs$ = this.empleadoSeleccionado
      ? this.turnoService.obtenerTurnosDelDia(Number(this.empleadoSeleccionado), this.fechaActual)
      : this.turnoService.obtenerTodosLosTurnosDelDia(this.fechaActual);

    obs$.subscribe({
      next: (turnos) => {
        this.turnos.set(turnos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  cambiarEstado(turnoId: number, estado: string) {
    const estadoEnum = estado as EstadoTurno;
    this.turnoService.cambiarEstadoTurno(turnoId, estadoEnum).subscribe({
      next: () => this.cargarTurnos()
    });
  }

  obtenerTextoEstado(estado: EstadoTurno): string {
    const textos: Record<EstadoTurno, string> = {
      [EstadoTurno.RESERVADO]: 'Reservado',
      [EstadoTurno.CONFIRMADO]: 'Confirmado',
      [EstadoTurno.EN_CURSO]: 'En curso',
      [EstadoTurno.FINALIZADO]: 'Finalizado',
      [EstadoTurno.CANCELADO]: 'Cancelado',
      [EstadoTurno.NO_ASISTIO]: 'No asistió'
    };
    return textos[estado];
  }
}
