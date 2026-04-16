import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { Sucursal } from '../../models/models';
import { SucursalService } from '../../services/sucursal.service';

/**
 * Componente selector de sucursal
 * Permite cambiar entre sucursales en toda la aplicación
 */
@Component({
  selector: 'app-sucursal-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="sucursal-selector" role="group" aria-label="Selector de sucursal">
      <mat-form-field appearance="outline" class="sucursal-field" subscriptSizing="dynamic">
        <mat-label>Sucursal</mat-label>
        <mat-select
          [(ngModel)]="selectedSucursalId"
          (selectionChange)="cambiarSucursal($event.value)">
          <mat-option [value]="null" disabled>Seleccionar sucursal...</mat-option>
          @for (sucursal of sucursales(); track sucursal.id) {
            <mat-option [value]="sucursal.id">{{ sucursal.nombre }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <button
        type="button"
        mat-icon-button
        color="primary"
        class="btn-reload"
        (click)="recargarDatos()"
        aria-label="Recargar datos de sucursal">
        <mat-icon>refresh</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .sucursal-selector {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      min-width: 0;
      width: min(420px, 100%);
      padding: 0.2rem 0.25rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid #dbe3ef;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
    }

    .sucursal-field {
      flex: 1;
      min-width: 0;
      margin: 0;
    }

    :host ::ng-deep .sucursal-field .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    :host ::ng-deep .sucursal-field .mat-mdc-text-field-wrapper {
      background: #ffffff;
      border-radius: 10px;
    }

    :host ::ng-deep .sucursal-field .mat-mdc-form-field-infix {
      min-height: 44px;
      padding-top: 10px;
      padding-bottom: 8px;
    }

    .btn-reload {
      flex-shrink: 0;
      border-radius: 10px;
      border: 1px solid #dbe3ef;
      background: #ffffff;
      width: 42px;
      height: 42px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn-reload:hover {
      transform: rotate(12deg);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    }

    @media (max-width: 768px) {
      .sucursal-selector {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .sucursal-selector {
        padding: 0.2rem;
      }

      .btn-reload {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class SucursalSelectorComponent implements OnInit {
  sucursales = signal<Sucursal[]>([]);
  sucursalActual = signal<Sucursal | null>(null);
  selectedSucursalId: number | null = null;

  constructor(private sucursalService: SucursalService, private router: Router) {
    this.sucursalActual = this.sucursalService.sucursalActual;
    this.sucursales = this.sucursalService.sucursales;
  }

  ngOnInit(): void {
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.sucursalService.listarActivas().subscribe({
      next: (sucursales) => {
        this.sucursales.set(sucursales || []);

        // Si no hay sucursal seleccionada y hay sucursales disponibles, seleccionar la primera
        if (!this.sucursalActual() && sucursales.length > 0) {
          this.sucursalService.setSucursalActual(sucursales[0]);
          this.selectedSucursalId = sucursales[0].id || null;
          return;
        }

        this.selectedSucursalId = this.sucursalActual()?.id || null;
      },
      error: (error) => {
        console.error('Error al cargar sucursales:', error);
      }
    });
  }

  cambiarSucursal(sucursalId: number | null): void {
    if (!sucursalId) return;
    
    const sucursal = this.sucursales().find(s => Number(s.id) === Number(sucursalId));
    if (sucursal) {
      const sucursalAnteriorId = this.sucursalActual()?.id;
      this.sucursalService.setSucursalActual(sucursal);
      this.selectedSucursalId = sucursal.id || null;

      // Al cambiar de sucursal forzamos la recarga del componente/ruta actual.
      if (sucursalAnteriorId !== sucursal.id) {
        this.recargarVistaActual();
      }
    }
  }

  recargarDatos(): void {
    // Forzar recarga de datos de la sucursal actual
    const actual = this.sucursalActual();
    if (actual) {
      this.sucursalService.setSucursalActual(actual);
      this.recargarVistaActual();
    }
  }

  private recargarVistaActual(): void {
    const urlActual = this.router.url;
    void this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      void this.router.navigateByUrl(urlActual);
    });
  }
}
