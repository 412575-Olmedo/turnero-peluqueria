import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlidingPanelComponent } from '../sliding-panel/sliding-panel.component';

/**
 * Componente de formulario para registrar consumo de productos
 */
@Component({
  selector: 'app-consumo-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SlidingPanelComponent],
  template: `
    <app-sliding-panel 
      [isOpen]="isOpen" 
      [title]="'Registrar Consumo'"
      (onClose)="cerrar()">
      
      <form (ngSubmit)="guardar()" class="form-container">
        <div class="form-group">
          <label for="producto">Producto *</label>
          @if (productoSeleccionado) {
            <input 
              type="text" 
              [value]="productoSeleccionado.nombre + ' (' + productoSeleccionado.stockActual + ' ' + productoSeleccionado.unidad + ')'" 
              disabled
              class="form-input input-disabled">
          } @else {
            <select 
              [(ngModel)]="formData.productoId" 
              id="producto"
              name="producto"
              required
              class="form-input">
              <option [value]="0">Seleccionar producto...</option>
              @for (prod of productos; track prod.id) {
                <option [value]="prod.id">
                  {{ prod.nombre }} ({{ prod.stockActual }} {{ prod.unidad }})
                </option>
              }
            </select>
          }
        </div>

        <div class="form-group">
          <label for="cantidad">Cantidad Usada *</label>
          <input 
            type="number" 
            id="cantidad"
            [(ngModel)]="formData.cantidad"
            name="cantidad"
            min="1"
            required
            class="form-input">
          <small>Ingrese la cantidad consumida</small>
        </div>

        <div class="form-group">
          <label for="turnoId">Turno Asociado (Opcional)</label>
          <input 
            type="number" 
            id="turnoId"
            [(ngModel)]="formData.turnoId"
            name="turnoId"
            placeholder="Número de turno"
            class="form-input">
          <small>Deje en blanco si no está asociado a un turno</small>
        </div>

        <div class="info-box">
          <span class="icon">ℹ️</span>
          <p>El consumo se registrará como salida de stock</p>
        </div>

        @if (error) {
          <div class="error-message">{{ error }}</div>
        }

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="cerrar()">
            Cancelar
          </button>
          <button type="submit" class="btn-primary">
            Registrar Consumo
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

    .input-disabled {
      background: #f9fafb;
      color: #6b7280;
      cursor: not-allowed;
    }

    .info-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
    }

    .info-box .icon {
      font-size: 1.5rem;
    }

    .info-box p {
      margin: 0;
      color: #1e40af;
      font-size: 0.875rem;
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
export class ConsumoFormComponent {
  @Input() isOpen: boolean = false;
  @Input() productos: any[] = [];
  @Input() productoSeleccionado: any = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();
  error = '';

  formData = {
    productoId: 0,
    cantidad: 1,
    turnoId: null as number | null
  };

  ngOnChanges(): void {
    if (this.productoSeleccionado) {
      this.formData.productoId = this.productoSeleccionado.id;
    } else {
      this.formData.productoId = 0;
    }
    this.formData.cantidad = 1;
    this.formData.turnoId = null;
  }

  cerrar(): void {
    this.error = '';
    this.onClose.emit();
  }

  guardar(): void {
    if (!this.formData.productoId || this.formData.cantidad <= 0) {
      this.error = 'Seleccioná un producto y una cantidad válida.';
      return;
    }

    this.error = '';
    this.onSave.emit(this.formData);
  }
}
