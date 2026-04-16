import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteInfo } from '../../../models/models';
import { ReservaService } from '../../../services/reserva.service';

@Component({
  selector: 'app-resumen-turno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resumen-turno.component.html',
  styleUrl: './resumen-turno.component.css'
})
export class ResumenTurnoComponent {
  readonly reservaService = inject(ReservaService);
  readonly router = inject(Router);
  
  reservaState = this.reservaService.reservaState;
  
  // Formulario de cliente
  clienteInfo = signal<ClienteInfo>({
    nombre: '',
    telefono: '',
    email: ''
  });

  procesando = signal(false);
  error = signal<string | null>(null);

  // Validación
  formularioValido = computed(() => {
    const info = this.clienteInfo();
    return info.nombre.trim().length > 0 && 
           info.telefono.trim().length >= 8;
  });

  actualizarCampo(campo: keyof ClienteInfo, valor: string) {
    this.clienteInfo.update(info => ({ ...info, [campo]: valor }));
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }

  confirmarReserva() {
    if (!this.formularioValido()) {
      this.error.set('Por favor, completa todos los campos requeridos');
      return;
    }

    this.procesando.set(true);
    this.error.set(null);

    // Guardar info del cliente en el estado
    this.reservaService.guardarClienteInfo(this.clienteInfo());

    // Construir request
    const turnoRequest = this.reservaService.construirTurnoRequest();

    if (!turnoRequest) {
      this.error.set('Información incompleta. Por favor, verifica los datos.');
      this.procesando.set(false);
      return;
    }

    // Crear la reserva
    this.reservaService.crearReserva(turnoRequest).subscribe({
      next: (turno) => {
        console.log('Turno creado exitosamente:', turno);
        this.procesando.set(false);
        
        // Navegar a página de confirmación con el ID del turno
        if (turno && turno.id) {
          this.router.navigate(['/turno-confirmado', turno.id]);
        } else {
          this.error.set('Error: No se recibió el ID del turno creado');
        }

        // Resetear estado de reserva
        this.reservaService.resetearReserva();
      },
      error: (err) => {
        console.error('Error al crear reserva:', err);
        this.error.set(
          err.error?.message || 
          'No se pudo completar la reserva. Por favor, intenta nuevamente.'
        );
        this.procesando.set(false);
      }
    });
  }

  volverAtras() {
    this.reservaState.update(state => ({
      ...state,
      paso: 3,
      horarioSeleccionado: undefined
    }));
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
