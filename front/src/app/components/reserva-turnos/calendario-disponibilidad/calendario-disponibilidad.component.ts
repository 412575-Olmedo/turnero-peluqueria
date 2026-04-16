import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { addMonths, eachDayOfInterval, endOfMonth, format, isBefore, isToday, startOfDay, startOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { DiaDisponibilidad } from '../../../models/models';
import { ReservaService } from '../../../services/reserva.service';

@Component({
  selector: 'app-calendario-disponibilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario-disponibilidad.component.html',
  styleUrl: './calendario-disponibilidad.component.css'
})
export class CalendarioDisponibilidadComponent implements OnInit {
  readonly reservaService = inject(ReservaService);
  mesActual = signal(new Date());
  disponibilidad = signal<DiaDisponibilidad[]>([]);
  cargando = signal(false);
  
  reservaState = this.reservaService.reservaState;

  // Computed values
  nombreMes = computed(() => 
    format(this.mesActual(), 'MMMM yyyy', { locale: es })
  );

  diasDelMes = computed(() => {
    const inicio = startOfMonth(this.mesActual());
    const fin = endOfMonth(this.mesActual());
    const dias = eachDayOfInterval({ start: inicio, end: fin });
    
    // Agregar días del mes anterior para completar la primera semana
    const primerDia = inicio.getDay();
    const diasAnteriores = primerDia === 0 ? 6 : primerDia - 1; // Lunes = 0
    
    const diasCompletos = [];
    
    // Días del mes anterior
    for (let i = diasAnteriores; i > 0; i--) {
      const dia = new Date(inicio);
      dia.setDate(dia.getDate() - i);
      diasCompletos.push({ fecha: dia, esDelMes: false });
    }
    
    // Días del mes actual
    dias.forEach(dia => {
      diasCompletos.push({ fecha: dia, esDelMes: true });
    });
    
    return diasCompletos;
  });

  ngOnInit() {
    this.cargarDisponibilidad();
  }

  cargarDisponibilidad() {
    const state = this.reservaState();
    
    if (!state.servicioSeleccionado) {
      return;
    }

    this.cargando.set(true);
    
    const mes = this.mesActual().getMonth() + 1;
    const anio = this.mesActual().getFullYear();
    const empleadoId = state.empleadoSeleccionado?.id || null;

    this.reservaService.obtenerDisponibilidadMes(
      state.servicioSeleccionado.id,
      empleadoId,
      mes,
      anio
    ).subscribe({
      next: (disponibilidad) => {
        this.disponibilidad.set(disponibilidad);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar disponibilidad:', err);
        this.cargando.set(false);
      }
    });
  }

  obtenerDisponibilidadDia(fecha: Date): DiaDisponibilidad | undefined {
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    return this.disponibilidad().find(d => d.fecha === fechaStr);
  }

  obtenerClaseDia(dia: { fecha: Date; esDelMes: boolean }): string {
    const hoy = startOfDay(new Date());
    const fechaDia = startOfDay(dia.fecha);
    
    // Día no del mes actual
    if (!dia.esDelMes) {
      return 'text-gray-300 cursor-not-allowed';
    }
    
    // Día pasado
    if (isBefore(fechaDia, hoy)) {
      return 'text-gray-400 cursor-not-allowed line-through';
    }
    
    const disponibilidad = this.obtenerDisponibilidadDia(dia.fecha);
    
    if (!disponibilidad || !disponibilidad.disponible) {
      return 'text-gray-400 cursor-not-allowed';
    }
    
    // Días disponibles con diferentes niveles
    const baseClasses = 'cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all';
    
    switch (disponibilidad.nivel) {
      case 'alto':
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`;
      case 'medio':
        return `${baseClasses} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`;
      case 'bajo':
        return `${baseClasses} bg-orange-100 text-orange-800 hover:bg-orange-200`;
      default:
        return 'text-gray-400 cursor-not-allowed';
    }
  }

  seleccionarDia(dia: { fecha: Date; esDelMes: boolean }) {
    if (!dia.esDelMes) return;
    
    const hoy = startOfDay(new Date());
    const fechaDia = startOfDay(dia.fecha);
    
    if (isBefore(fechaDia, hoy)) return;
    
    const disponibilidad = this.obtenerDisponibilidadDia(dia.fecha);
    
    if (!disponibilidad || !disponibilidad.disponible) {
      return;
    }
    
    const fechaStr = format(dia.fecha, 'yyyy-MM-dd');
    this.reservaService.seleccionarFecha(fechaStr);
  }

  mesAnterior() {
    const nuevoMes = subMonths(this.mesActual(), 1);
    
    // No permitir ir a meses pasados
    if (isBefore(endOfMonth(nuevoMes), startOfDay(new Date()))) {
      return;
    }
    
    this.mesActual.set(nuevoMes);
    this.cargarDisponibilidad();
  }

  mesSiguiente() {
    this.mesActual.set(addMonths(this.mesActual(), 1));
    this.cargarDisponibilidad();
  }

  volverAtras() {
    this.reservaService.actualizarPaso(2);
  }

  esDiaSeleccionado(dia: { fecha: Date; esDelMes: boolean }): boolean {
    if (!dia.esDelMes) return false;
    const state = this.reservaState();
    if (!state.fechaSeleccionada) return false;
    const fechaStr = format(dia.fecha, 'yyyy-MM-dd');
    return fechaStr === state.fechaSeleccionada;
  }

  esHoy(dia: { fecha: Date; esDelMes: boolean }): boolean {
    return dia.esDelMes && isToday(dia.fecha);
  }

  // Método helper para crear objetos de día desde string de fecha
  crearDiaDesdeString(fechaStr: string): { fecha: Date; esDelMes: boolean } {
    return {
      fecha: new Date(fechaStr),
      esDelMes: true
    };
  }
}
