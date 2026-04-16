import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Empleado, JornadaTrabajo, ResumenMensual } from '../models/models';
import { AsistenciaService } from '../services/asistencia.service';
import { EmpleadoService } from '../services/empleado.service';

@Component({
  selector: 'app-gestion-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-asistencia.component.html',
  styleUrls: ['./gestion-asistencia.component.css']
})
export class GestionAsistenciaComponent implements OnInit {
  empleados = signal<Empleado[]>([]);
  empleadoSeleccionado = signal<number | null>(null);
  mesSeleccionado = signal<number>(new Date().getMonth() + 1);
  anioSeleccionado = signal<number>(new Date().getFullYear());
  
  jornadasAbiertas = signal<JornadaTrabajo[]>([]);
  resumenMensual = signal<ResumenMensual | null>(null);
  cargando = signal(false);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);

  meses = [
    { valor: 1, nombre: 'Enero' }, { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' }, { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' }, { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' }, { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' }, { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' }, { valor: 12, nombre: 'Diciembre' }
  ];

  constructor(
    public asistenciaService: AsistenciaService,
    private empleadoService: EmpleadoService
  ) {}

  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarJornadasAbiertas();
  }

  cargarEmpleados(): void {
    this.empleadoService.listarEmpleados().subscribe({
      next: (empleados: Empleado[]) => {
        this.empleados.set(empleados.filter((e: Empleado) => e.activo));
      },
      error: (err: any) => console.error('Error al cargar empleados:', err)
    });
  }

  cargarJornadasAbiertas(): void {
    this.asistenciaService.obtenerJornadasAbiertas().subscribe({
      next: (jornadas) => {
        this.jornadasAbiertas.set(jornadas);
      },
      error: (err) => console.error('Error al cargar jornadas abiertas:', err)
    });
  }

  onEmpleadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const empleadoId = select.value ? Number(select.value) : null;
    this.empleadoSeleccionado.set(empleadoId);
    if (empleadoId) {
      this.cargarResumen();
    }
  }

  onMesChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.mesSeleccionado.set(Number(select.value));
    if (this.empleadoSeleccionado()) {
      this.cargarResumen();
    }
  }

  cargarResumen(): void {
    const empId = this.empleadoSeleccionado();
    if (!empId) return;

    this.cargando.set(true);
    this.asistenciaService.obtenerResumenEmpleado(
      empId,
      this.mesSeleccionado(),
      this.anioSeleccionado()
    ).subscribe({
      next: (resumen) => {
        this.resumenMensual.set(resumen);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);
        this.cargando.set(false);
      }
    });
  }

  marcarMesComoPagado(): void {
    this.mensaje.set(null);
    this.error.set(null);
    const resumen = this.resumenMensual();
    if (!resumen) return;

    const jornadasPendientes = resumen.jornadas
      .filter(j => !j.pagado && j.horaSalida)
      .map(j => j.id);

    if (jornadasPendientes.length === 0) {
      this.mensaje.set('No hay jornadas pendientes de pago.');
      return;
    }

    if (!confirm(`¿Marcar ${jornadasPendientes.length} jornadas como pagadas?`)) {
      return;
    }

    this.asistenciaService.marcarComoPagado({
      jornadaIds: jornadasPendientes,
      fechaPago: new Date().toISOString().split('T')[0]
    }).subscribe({
      next: () => {
        this.mensaje.set('Jornadas marcadas como pagadas.');
        this.cargarResumen();
      },
      error: (err) => {
        console.error('Error:', err);
        this.error.set('No se pudo marcar como pagado. Intentalo nuevamente.');
      }
    });
  }
}
