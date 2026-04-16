import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AsistenciaComponent } from '../../asistencia/asistencia.component';
import { EstadoTurno, Turno } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { EmpleadoService } from '../../services/empleado.service';
import { SucursalService } from '../../services/sucursal.service';
import { TurnoService } from '../../services/turno.service';
import { StockEmpleadoComponent } from '../stock-empleado/stock-empleado.component';

@Component({
  selector: 'app-panel-empleado',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    AsistenciaComponent,
    StockEmpleadoComponent
  ],
  templateUrl: './panel-empleado.component.html',
  styleUrl: './panel-empleado.component.css'
})
export class PanelEmpleadoComponent implements OnInit {
  private authService = inject(AuthService);
  private turnoService = inject(TurnoService);
  private empleadoService = inject(EmpleadoService);
  private sucursalService = inject(SucursalService);
  private router = inject(Router);

  // Tab activa
  tabActiva = signal<'turnos' | 'stock' | 'asistencia'>('asistencia');

  // Signals para estado del componente
  misTurnos = this.turnoService.turnos;
  empleadoNombre = signal<string>('');
  cargando = this.turnoService.loading;
  error = this.turnoService.error;
  accionError = signal<string | null>(null);
  fechaActual = signal<string>(new Date().toLocaleDateString('es-AR'));
  horaActual = signal<string>(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.turnoService.cargarMisTurnos().subscribe({
      error: (err) => {
        console.error('Error al cargar turnos:', err);
      }
    });

    // Cargar nombre del empleado
    const user = this.authService.currentUser();
    if (user) {
      this.empleadoService.obtenerEmpleadoPorUsername(user.username).subscribe({
        next: (empleado) => {
          this.empleadoNombre.set(empleado.nombre || user.username);

          if (empleado.sucursalId) {
            this.sucursalService.obtenerPorId(empleado.sucursalId).subscribe({
              next: (sucursal) => this.sucursalService.setSucursalActual(sucursal),
              error: () => this.empleadoNombre.set(empleado.nombre || user.username)
            });
          }
        },
        error: () => this.empleadoNombre.set(user.username)
      });
    }
  }

  cambiarEstado(turnoId: number, nuevoEstado: EstadoTurno): void {
    this.accionError.set(null);
    if (!confirm(`¿Confirmar cambio de estado a ${nuevoEstado}?`)) {
      return;
    }

    this.turnoService.cambiarEstadoTurno(turnoId, nuevoEstado).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.accionError.set('No se pudo cambiar el estado del turno.');
      }
    });
  }

  refrescar(): void {
    this.cargarDatos();
  }

  cambiarTab(tab: 'turnos' | 'stock' | 'asistencia'): void {
    this.tabActiva.set(tab);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getEstadoClase(estado: EstadoTurno): string {
    const clases: { [key in EstadoTurno]: string } = {
      RESERVADO: 'estado-reservado',
      CONFIRMADO: 'estado-confirmado',
      EN_CURSO: 'estado-en-curso',
      FINALIZADO: 'estado-finalizado',
      CANCELADO: 'estado-cancelado',
      NO_ASISTIO: 'estado-no-asistio'
    };
    return clases[estado] || '';
  }

  getEstadoTexto(estado: EstadoTurno): string {
    const textos: { [key in EstadoTurno]: string } = {
      RESERVADO: 'Reservado',
      CONFIRMADO: 'Confirmado',
      EN_CURSO: 'En Curso',
      FINALIZADO: 'Finalizado',
      CANCELADO: 'Cancelado',
      NO_ASISTIO: 'No Asistió'
    };
    return textos[estado] || estado;
  }

  turnosProximos(): Turno[] {
    const ahora = new Date();
    return this.misTurnos().filter(t => {
      const fechaHoraTurno = new Date(t.fechaHoraInicio);
      return fechaHoraTurno > ahora && (t.estado === 'RESERVADO' || t.estado === 'CONFIRMADO');
    });
  }

  turnosEnCurso(): Turno[] {
    return this.misTurnos().filter(t => t.estado === 'EN_CURSO');
  }

  turnosFinalizados(): Turno[] {
    return this.misTurnos().filter(t => 
      t.estado === 'FINALIZADO' || 
      t.estado === 'NO_ASISTIO' || 
      t.estado === 'CANCELADO'
    );
  }

  // Extraer solo la hora de fechaHoraInicio
  getHora(fechaHoraInicio: string): string {
    return new Date(fechaHoraInicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  getTabFromIndex(index: number): 'asistencia' | 'turnos' | 'stock' {
    const tabs: ('asistencia' | 'turnos' | 'stock')[] = ['asistencia', 'turnos', 'stock'];
    return tabs[index] || 'asistencia';
  }

  getTabIndex(tab: 'asistencia' | 'turnos' | 'stock'): number {
    const tabOrder: ('asistencia' | 'turnos' | 'stock')[] = ['asistencia', 'turnos', 'stock'];
    const index = tabOrder.indexOf(tab);
    return index >= 0 ? index : 0;
  }

  protected readonly EstadoTurno = EstadoTurno;
}
