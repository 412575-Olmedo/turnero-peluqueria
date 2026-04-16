import { CommonModule } from '@angular/common';
import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { JornadaActual, JornadaTrabajo, ResumenMensual } from '../models/models';
import { AsistenciaService } from '../services/asistencia.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.css']
})
export class AsistenciaComponent implements OnInit, OnDestroy {
  jornadaActual = signal<JornadaActual>({ trabajando: false });
  historial = signal<JornadaTrabajo[]>([]);
  resumenMensual = signal<ResumenMensual | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);
  exito = signal<string | null>(null);
  mostrarHistorial = signal(false);

  // Computed para datos derivados
  trabajando = computed(() => this.jornadaActual().trabajando);
  horaEntradaFormateada = computed(() => {
    const entrada = this.jornadaActual().horaEntrada;
    return entrada ? this.asistenciaService.formatearHora(entrada) : '-';
  });
  
  montoEstimadoHoy = computed(() => {
    const jornada = this.jornadaActual();
    const resumen = this.resumenMensual();
    if (!jornada.trabajando || !jornada.minutosTrabajados || !resumen?.precioHora) {
      return 0;
    }
    return this.asistenciaService.calcularMontoEstimado(jornada.minutosTrabajados, resumen.precioHora);
  });

  // Intervalo para actualizar el tiempo transcurrido
  private intervalo: any;

  constructor(public asistenciaService: AsistenciaService) {}

  ngOnInit(): void {
    this.cargarDatos();
    
    // Actualizar cada 30 segundos
    this.intervalo = setInterval(() => {
      this.actualizarJornadaActual();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);

    // Cargar jornada actual
    this.asistenciaService.obtenerJornadaActual().subscribe({
      next: (jornada) => {
        this.jornadaActual.set(jornada);
      },
      error: (err) => {
        console.error('Error al cargar jornada actual:', err);
        this.error.set('Error al cargar el estado de la jornada');
      }
    });

    // Cargar resumen del mes
    this.asistenciaService.obtenerResumenMensual().subscribe({
      next: (resumen) => {
        this.resumenMensual.set(resumen);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);
        this.cargando.set(false);
      }
    });

    // Cargar historial
    this.asistenciaService.obtenerHistorial().subscribe({
      next: (jornadas) => {
        this.historial.set(jornadas);
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
      }
    });
  }

  actualizarJornadaActual(): void {
    this.asistenciaService.obtenerJornadaActual().subscribe({
      next: (jornada) => {
        this.jornadaActual.set(jornada);
      },
      error: (err) => {
        console.error('Error al actualizar jornada:', err);
      }
    });
  }

  marcarEntrada(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.asistenciaService.marcarEntrada().subscribe({
      next: () => {
        this.cargarDatos();
        this.exito.set('Entrada registrada correctamente.');
      },
      error: (err) => {
        console.error('Error al marcar entrada:', err);
        this.error.set(err.error?.message || 'Error al marcar entrada');
        this.cargando.set(false);
      }
    });
  }

  marcarSalida(): void {
    if (!confirm('¿Confirmar salida?')) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.asistenciaService.marcarSalida().subscribe({
      next: (jornada) => {
        console.log('==== RESPUESTA MARCAR SALIDA ====');
        console.log('Jornada recibida:', jornada);
        console.log('Horas trabajadas:', jornada.horasTrabajadas, 'tipo:', typeof jornada.horasTrabajadas);
        console.log('Monto a pagar:', jornada.montoAPagar, 'tipo:', typeof jornada.montoAPagar);
        
        this.cargarDatos();
        const horas = jornada.horasTrabajadas ?? 0;
        const monto = jornada.montoAPagar ?? 0;
        const mensaje = `✅ Salida registrada\n\n` +
          `Horas trabajadas: ${horas.toFixed(2)}h\n` +
          `Monto a cobrar: $${monto.toLocaleString('es-AR')}`;
        this.exito.set(mensaje);
      },
      error: (err) => {
        console.error('Error al marcar salida:', err);
        this.error.set(err.error?.message || 'Error al marcar salida');
        this.cargando.set(false);
      }
    });
  }

  toggleHistorial(): void {
    this.mostrarHistorial.set(!this.mostrarHistorial());
  }

  getNombreMes(): string {
    const resumen = this.resumenMensual();
    if (!resumen) return '';
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[resumen.mes - 1];
  }

  getEstadoIcono(jornada: JornadaTrabajo): string {
    if (jornada.pagado) return '✅';
    if (!jornada.horaSalida) return '⏳';
    return '⏳';
  }

  getEstadoTexto(jornada: JornadaTrabajo): string {
    if (jornada.pagado) return 'Pagado';
    if (!jornada.horaSalida) return 'En curso';
    return 'Pendiente';
  }

  getHoraActual(): string {
    return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  getFechaActual(): string {
    return new Date().toLocaleDateString('es-AR');
  }
}
