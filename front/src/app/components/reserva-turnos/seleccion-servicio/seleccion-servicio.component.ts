import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Servicio } from '../../../models/models';
import { ReservaService } from '../../../services/reserva.service';
import { ServicioService } from '../../../services/servicio.service';
import { SucursalService } from '../../../services/sucursal.service';

@Component({
  selector: 'app-seleccion-servicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleccion-servicio.component.html',
  styleUrl: './seleccion-servicio.component.css'
})
export class SeleccionServicioComponent implements OnInit {
  readonly servicioService = inject(ServicioService);
  readonly reservaService = inject(ReservaService);
  readonly sucursalService = inject(SucursalService);
  
  servicios = signal<Servicio[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  constructor() {
    // Recargar servicios cuando cambia la sucursal
    effect(() => {
      // Usar el signal de cambio para detectar cualquier cambio de sucursal
      this.sucursalService.getCambioSignal()();
      const sucursal = this.sucursalService.sucursalActual();
      if (sucursal) {
        this.cargarServicios();
      }
    });
  }

  ngOnInit() {
    this.cargarServicios();
  }

  cargarServicios() {
    this.cargando.set(true);
    this.error.set(null);

    this.servicioService.listarServicios().subscribe({
      next: (servicios) => {
        // Filtrar solo servicios activos
        this.servicios.set(servicios.filter(s => s.activo));
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.error.set('No se pudieron cargar los servicios. Por favor, intenta nuevamente.');
        this.cargando.set(false);
      }
    });
  }

  seleccionarServicio(servicio: Servicio) {
    this.reservaService.seleccionarServicio(servicio);
  }

  formatearPrecio(precio: number): string {
    return `$${precio.toLocaleString('es-AR')}`;
  }

  formatearDuracion(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas > 0 && mins > 0) {
      return `${horas}h ${mins}min`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      return `${mins} min`;
    }
  }
}
