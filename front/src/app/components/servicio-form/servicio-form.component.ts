import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Servicio } from '../../models/models';
import { SlidingPanelComponent } from '../sliding-panel/sliding-panel.component';

/**
 * Componente de formulario de servicio en panel deslizable
 */
@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SlidingPanelComponent],
  template: `
    <app-sliding-panel 
      [isOpen]="isOpen" 
      [title]="servicio ? 'Editar Servicio' : 'Nuevo Servicio'"
      (onClose)="cerrar()">
      
      <form (ngSubmit)="guardar()" class="form-container">
        <div class="form-group">
          <label for="nombre">Nombre del Servicio *</label>
          <input 
            type="text" 
            id="nombre"
            [(ngModel)]="formData.nombre" 
            name="nombre" 
            placeholder="Ej: Corte de Cabello"
            required
            class="form-input">
        </div>

        <div class="form-group">
          <label for="descripcion">Descripción</label>
          <textarea 
            id="descripcion"
            [(ngModel)]="formData.descripcion" 
            name="descripcion"
            placeholder="Describe el servicio..."
            rows="3"
            class="form-input"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="duracion">Duración (minutos) *</label>
            <input 
              type="number" 
              id="duracion"
              [(ngModel)]="formData.duracionMinutos" 
              name="duracion"
              placeholder="30"
              min="5"
              max="480"
              required
              class="form-input">
          </div>

          <div class="form-group">
            <label for="precio">Precio ($) *</label>
            <input 
              type="number" 
              id="precio"
              [(ngModel)]="formData.precio" 
              name="precio"
              placeholder="5000"
              min="0"
              step="100"
              required
              class="form-input">
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              [(ngModel)]="formData.activo" 
              name="activo">
            <span>Servicio activo</span>
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
            {{ servicio ? 'Actualizar' : 'Crear' }} Servicio
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    textarea.form-input {
      resize: vertical;
      font-family: inherit;
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
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }
    }
  `]
})
export class ServicioFormComponent {
  @Input() isOpen: boolean = false;
  @Input() servicio: Servicio | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Servicio>();
  error = '';

  formData: Partial<Servicio> = {
    nombre: '',
    descripcion: '',
    duracionMinutos: 30,
    precio: 0,
    activo: true
  };

  ngOnChanges(): void {
    if (this.servicio) {
      this.formData = { ...this.servicio };
    } else {
      this.formData = {
        nombre: '',
        descripcion: '',
        duracionMinutos: 30,
        precio: 0,
        activo: true
      };
    }
  }

  cerrar(): void {
    this.error = '';
    this.onClose.emit();
  }

  guardar(): void {
    if (!this.formData.nombre || !this.formData.duracionMinutos || !this.formData.precio) {
      this.error = 'Completá los campos obligatorios del servicio.';
      return;
    }

    if (this.formData.duracionMinutos < 5) {
      this.error = 'La duración mínima es de 5 minutos.';
      return;
    }

    if (this.formData.precio < 0) {
      this.error = 'El precio no puede ser negativo.';
      return;
    }

    this.error = '';
    this.onSave.emit(this.formData as Servicio);
  }
}
