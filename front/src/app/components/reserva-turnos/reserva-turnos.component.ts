import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ReservaService } from '../../services/reserva.service';
import { SucursalService } from '../../services/sucursal.service';
import { CalendarioDisponibilidadComponent } from './calendario-disponibilidad/calendario-disponibilidad.component';
import { HorariosDisponiblesComponent } from './horarios-disponibles/horarios-disponibles.component';
import { ResumenTurnoComponent } from './resumen-turno/resumen-turno.component';
import { SeleccionEmpleadoComponent } from './seleccion-empleado/seleccion-empleado.component';
import { SeleccionServicioComponent } from './seleccion-servicio/seleccion-servicio.component';

@Component({
  selector: 'app-reserva-turnos',
  standalone: true,
  imports: [
    CommonModule,
    SeleccionServicioComponent,
    SeleccionEmpleadoComponent,
    CalendarioDisponibilidadComponent,
    HorariosDisponiblesComponent,
    ResumenTurnoComponent
  ],
  templateUrl: './reserva-turnos.component.html',
  styleUrl: './reserva-turnos.component.css'
})
export class ReservaTurnosComponent {
  readonly reservaService = inject(ReservaService);
  readonly sucursalService = inject(SucursalService);
  reservaState = this.reservaService.reservaState;
  
  sucursales = this.sucursalService.sucursales;
  sucursalActual = this.sucursalService.sucursalActual;

  // Computed para saber qué componente mostrar
  componenteActual = computed(() => {
    const state = this.reservaState();
    
    // Paso 1: Selección de servicio
    if (!state.servicioSeleccionado) {
      return 'servicio';
    }
    
    // Paso 2: Selección de empleado (o pasar directo a calendario)
    if (!state.fechaSeleccionada && state.paso === 2) {
      return 'empleado';
    }
    
    // Paso 2/3: Selección de fecha
    if (!state.fechaSeleccionada) {
      return 'calendario';
    }
    
    // Paso 3: Selección de horario
    if (!state.horarioSeleccionado) {
      return 'horarios';
    }
    
    // Final: Resumen y confirmación
    return 'resumen';
  });

  // Progress bar
  progreso = computed(() => {
    const state = this.reservaState();
    let pasos = 0;
    const total = 4; // servicio, empleado/fecha, horario, confirmación
    
    if (state.servicioSeleccionado) pasos++;
    if (state.fechaSeleccionada) pasos += 1.5;
    if (state.horarioSeleccionado) pasos++;
    if (state.clienteInfo) pasos += 0.5;
    
    return (pasos / total) * 100;
  });

  cambiarSucursal(id: number): void {
    const sucursal = this.sucursales().find(s => s.id === id);
    if (sucursal) {
      this.sucursalService.setSucursalActual(sucursal);
      // Resetear la reserva si cambia la sucursal
      this.reservaService.resetearReserva();
    }
  }
}
