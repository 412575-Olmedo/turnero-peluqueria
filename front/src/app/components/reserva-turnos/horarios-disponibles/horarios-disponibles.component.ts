import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlotDisponible, SlotsDelDia } from '../../../models/models';
import { ReservaService } from '../../../services/reserva.service';

@Component({
  selector: 'app-horarios-disponibles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios-disponibles.component.html',
  styleUrl: './horarios-disponibles.component.css'
})
export class HorariosDisponiblesComponent implements OnInit {
  readonly reservaService = inject(ReservaService);
  
  slotsDelDia = signal<SlotsDelDia | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);
  
  // Filtros
  filtroHorario = signal<'todos' | 'manana' | 'tarde'>('todos');
  
  reservaState = this.reservaService.reservaState;

  // Slots agrupados por período
  slotsFiltrados = computed(() => {
    const slots = this.slotsDelDia();
    if (!slots) return { manana: [], tarde: [] };

    const manana: SlotDisponible[] = [];
    const tarde: SlotDisponible[] = [];

    slots.slots.forEach(slot => {
      // Mostrar todos los slots, no solo los disponibles
      const hora = parseInt(slot.horaInicio.split(':')[0]);
      
      if (hora < 14) {
        manana.push(slot);
      } else {
        tarde.push(slot);
      }
    });

    return { manana, tarde };
  });

  slotsAMostrar = computed(() => {
    const filtro = this.filtroHorario();
    const slots = this.slotsFiltrados();

    if (filtro === 'manana') {
      return { manana: slots.manana, tarde: [] };
    } else if (filtro === 'tarde') {
      return { manana: [], tarde: slots.tarde };
    } else {
      return slots;
    }
  });

  ngOnInit() {
    this.cargarHorariosDisponibles();
  }

  cargarHorariosDisponibles() {
    const state = this.reservaState();
    
    if (!state.servicioSeleccionado || !state.fechaSeleccionada) {
      this.error.set('Información incompleta');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    const empleadoId = state.empleadoSeleccionado?.id || null;

    this.reservaService.obtenerSlotsDelDia(
      state.servicioSeleccionado.id,
      empleadoId,
      state.fechaSeleccionada
    ).subscribe({
      next: (slots) => {
        this.slotsDelDia.set(slots);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar horarios:', err);
        this.error.set('No se pudieron cargar los horarios disponibles.');
        this.cargando.set(false);
      }
    });
  }

  seleccionarHorario(slot: SlotDisponible) {
    if (!slot.disponible || this.esHorarioPasado(slot)) return;
    this.reservaService.seleccionarHorario(slot);
  }

  esHorarioPasado(slot: SlotDisponible): boolean {
    const slotsDelDia = this.slotsDelDia();
    if (!slotsDelDia) return false;

    const ahora = new Date();
    const fechaSlot = new Date(slotsDelDia.fecha + 'T' + slot.horaInicio);
    
    return fechaSlot < ahora;
  }

  esHorarioDisponible(slot: SlotDisponible): boolean {
    return slot.disponible && !this.esHorarioPasado(slot);
  }

  volverAtras() {
    this.reservaState.update(state => ({
      ...state,
      paso: 2,
      fechaSeleccionada: undefined,
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

  esHorarioSeleccionado(slot: SlotDisponible): boolean {
    const horarioSeleccionado = this.reservaState().horarioSeleccionado;
    return horarioSeleccionado?.horaInicio === slot.horaInicio;
  }

  formatearHora(hora: string): string {
    // Quita los segundos si los tiene (formato HH:mm:ss -> HH:mm)
    return hora.substring(0, 5);
  }
}
