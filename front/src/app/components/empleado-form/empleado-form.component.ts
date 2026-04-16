import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Empleado } from '../../models/models';
import { SlidingPanelComponent } from '../sliding-panel/sliding-panel.component';

/**
 * Componente de formulario de empleado en panel deslizable
 * Reemplaza el modal anterior con mejor UX responsive
 */
@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SlidingPanelComponent],
  template: `
    <app-sliding-panel 
      [isOpen]="isOpen" 
      [title]="empleado ? 'Editar Empleado' : 'Nuevo Empleado'"
      (onClose)="cerrar()">
      
      <form (ngSubmit)="guardar()" class="form-container">
        <div class="form-group">
          <label for="nombre">Nombre Completo *</label>
          <input 
            type="text" 
            id="nombre"
            [(ngModel)]="formData.nombre" 
            name="nombre" 
            placeholder="Ej: Carlos Rodríguez"
            required
            class="form-input">
        </div>

        <div class="form-group">
          <label for="especialidad">Especialidad *</label>
          <input 
            type="text" 
            id="especialidad"
            [(ngModel)]="formData.especialidad" 
            name="especialidad"
            placeholder="Ej: Barbero / Estilista / Colorista"
            required
            class="form-input">
        </div>

        <div class="form-group">
          <label for="precioHora">Precio por Hora</label>
          <input 
            type="number" 
            id="precioHora"
            [(ngModel)]="formData.precioHora" 
            name="precioHora"
            placeholder="Ej: 5000"
            min="0"
            step="100"
            class="form-input">
          <small>Para cálculo de liquidaciones</small>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              [(ngModel)]="formData.activo" 
              name="activo">
            <span>Empleado activo</span>
          </label>
        </div>

        @if (error) {
          <div class="error-message">{{ error }}</div>
        }

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="cerrar()">
            Cancelar
          </button>
          <button type="submit" class="btn-primary">
            {{ empleado ? 'Actualizar' : 'Crear' }} Empleado
          </button>
        </div>
      </form>
    </app-sliding-panel>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .form-group small {
      color: #6b7280;
      font-size: 0.75rem;
      margin-top: -0.25rem;
    }

    .form-input {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: normal;
    }

    .checkbox-group input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .error-message {
      border: 1px solid #fecaca;
      border-left: 4px solid #dc2626;
      background: #fef2f2;
      color: #991b1b;
      border-radius: 8px;
      padding: 0.65rem 0.8rem;
      font-size: 0.9rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-primary,
    .btn-secondary {
      flex: 1;
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    @media (max-width: 640px) {
      .form-actions {
        flex-direction: column-reverse;
      }
    }
  `]
})
export class EmpleadoFormComponent {
  @Input() isOpen: boolean = false;
  @Input() empleado: Empleado | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Empleado>();
  error = '';

  formData: Partial<Empleado> = {
    nombre: '',
    especialidad: '',
    activo: true,
    precioHora: 0
  };

  ngOnChanges(): void {
    if (this.empleado) {
      this.formData = { ...this.empleado };
    } else {
      this.formData = {
        nombre: '',
        especialidad: '',
        activo: true,
        precioHora: 0
      };
    }
  }

  cerrar(): void {
    this.error = '';
    this.onClose.emit();
  }

  guardar(): void {
    if (!this.formData.nombre || !this.formData.especialidad) {
      this.error = 'Completá los campos obligatorios del colaborador.';
      return;
    }

    this.error = '';
    this.onSave.emit(this.formData as Empleado);
  }
}
