import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, LOCALE_ID, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Turno } from '../../models/models';
import { TurnoService } from '../../services/turno.service';

@Component({
  selector: 'app-turno-confirmado',
  standalone: true,
  imports: [CommonModule, DatePipe],
  providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
  templateUrl: './turno-confirmado.component.html',
  styleUrls: ['./turno-confirmado.component.css']
})
export class TurnoConfirmadoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private turnoService = inject(TurnoService);

  turno = signal<Turno | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  descargaError = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarTurno(Number(id));
    } else {
      this.error.set('No se especificó un ID de turno');
      this.cargando.set(false);
    }
  }

  cargarTurno(id: number): void {
    this.turnoService.obtenerTurno(id).subscribe({
      next: (turno) => {
        this.turno.set(turno);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el turno');
        this.cargando.set(false);
      }
    });
  }

  descargarComprobante(): void {
    const turno = this.turno();
    if (!turno) return;
    this.descargaError.set(null);

    this.turnoService.descargarComprobante(turno.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `turno-${turno.id}-${turno.clienteNombre}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.descargaError.set('No se pudo descargar el comprobante. Intentalo de nuevo en unos segundos.');
      }
    });
  }

  compartirWhatsApp(): void {
    const turno = this.turno();
    if (!turno) return;

    const mensaje = `¡Turno confirmado! 🎨\n\n` +
      `📅 Fecha: ${new Date(turno.fechaHoraInicio).toLocaleDateString('es-AR')}\n` +
      `🕐 Hora: ${new Date(turno.fechaHoraInicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}\n` +
      `💇 Servicio: ${turno.servicioNombre}\n` +
      `👤 Colaborador: ${turno.empleadoNombre}\n` +
      `📞 Código de confirmación: ${turno.codigoConfirmacion || turno.id}`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  volverInicio(): void {
    this.router.navigate(['/']);
  }
}
