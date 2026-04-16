import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Empleado, EmpleadoConCalificacion } from '../../../models/models';
import { EmpleadoService } from '../../../services/empleado.service';
import { ReservaService } from '../../../services/reserva.service';

@Component({
  selector: 'app-seleccion-empleado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleccion-empleado.component.html',
  styleUrl: './seleccion-empleado.component.css'
})
export class SeleccionEmpleadoComponent implements OnInit {
  readonly empleadoService = inject(EmpleadoService);
  readonly reservaService = inject(ReservaService);
  
  empleados = signal<EmpleadoConCalificacion[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  
  reservaState = this.reservaService.reservaState;

  ngOnInit() {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    const servicioId = this.reservaState().servicioSeleccionado?.id;
    
    if (!servicioId) {
      this.error.set('No se ha seleccionado un servicio');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    // Intentar obtener empleados por servicio, si falla, obtener todos
    this.reservaService.obtenerEmpleadosPorServicio(servicioId).subscribe({
      next: (empleados) => {
        this.procesarEmpleados(empleados);
      },
      error: () => {
        // Fallback: cargar todos los empleados activos
        this.empleadoService.listarEmpleados().subscribe({
          next: (empleados) => {
            this.procesarEmpleados(empleados.filter(e => e.activo));
          },
          error: (err) => {
            console.error('Error al cargar empleados:', err);
            this.error.set('No se pudieron cargar los profesionales.');
            this.cargando.set(false);
          }
        });
      }
    });
  }

  private procesarEmpleados(empleados: Empleado[]) {
    // Solo asignar empleados sin calificaciones ni reseñas
    this.empleados.set(empleados);
    this.cargando.set(false);
  }

  seleccionarEmpleado(empleado: Empleado) {
    this.reservaService.seleccionarEmpleado(empleado);
  }

  seleccionarCualquiera() {
    this.reservaService.seleccionarEmpleado(null);
  }

  volverAtras() {
    this.reservaService.actualizarPaso(1);
  }
}
