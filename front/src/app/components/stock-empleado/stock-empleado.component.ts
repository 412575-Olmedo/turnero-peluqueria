import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TipoMovimiento } from '../../models/models';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-stock-empleado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-empleado.component.html',
  styleUrl: './stock-empleado.component.css'
})
export class StockEmpleadoComponent implements OnInit {
  private productoService = inject(ProductoService);

  productos = this.productoService.productos;
  productosFiltrados = signal<any[]>([]);
  productosStockBajo = signal<any[]>([]);
  busqueda = signal('');
  mostrarFormConsumo = signal(false);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);
  
  // Consumo rápido
  consumoActual = {
    productoId: 0,
    productoNombre: '',
    cantidad: 1,
    turnoId: null as number | null
  };

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.listarProductos().subscribe({
      next: () => {
        this.filtrarProductos();
        this.cargarStockBajo();
      }
    });
  }

  cargarStockBajo(): void {
    this.productosStockBajo.set(this.productos().filter(p => p.stockBajo));
  }

  filtrarProductos(): void {
    const termino = this.busqueda().toLowerCase();
    const todos = this.productos();
    
    if (!termino) {
      this.productosFiltrados.set(todos);
    } else {
      this.productosFiltrados.set(
        todos.filter(p => 
          p.nombre.toLowerCase().includes(termino) ||
          p.categoria.toLowerCase().includes(termino)
        )
      );
    }
  }

  onBusquedaChange(valor: string): void {
    this.busqueda.set(valor);
    this.filtrarProductos();
  }

  abrirFormConsumo(producto?: any): void {
    this.mensaje.set(null);
    this.error.set(null);
    if (producto) {
      this.consumoActual = {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: 1,
        turnoId: null
      };
    } else {
      this.consumoActual = {
        productoId: 0,
        productoNombre: '',
        cantidad: 1,
        turnoId: null
      };
    }
    this.mostrarFormConsumo.set(true);
  }

  cerrarFormConsumo(): void {
    this.mostrarFormConsumo.set(false);
  }

  registrarConsumo(): void {
    this.mensaje.set(null);
    this.error.set(null);
    if (!this.consumoActual.productoId || this.consumoActual.cantidad <= 0) {
      this.error.set('Seleccioná un producto y una cantidad válida.');
      return;
    }

    const movimiento = {
      tipo: TipoMovimiento.SALIDA,
      cantidad: this.consumoActual.cantidad,
      motivo: this.consumoActual.turnoId 
        ? `Consumo - Turno #${this.consumoActual.turnoId}` 
        : 'Consumo registrado por empleado'
    };

    this.productoService.registrarMovimiento(this.consumoActual.productoId, movimiento).subscribe({
      next: () => {
        this.mensaje.set('Consumo registrado correctamente.');
        this.cerrarFormConsumo();
        this.cargarProductos();
      },
      error: (error) => {
        console.error('Error al registrar consumo:', error);
        this.error.set('No se pudo registrar el consumo.');
      }
    });
  }

  getProductosBajoStock(): number {
    return this.productosFiltrados().filter(p => p.stockActual <= p.stockMinimo).length;
  }

  getIconoCategoria(categoria: string): string {
    const iconos: { [key: string]: string } = {
      SHAMPOO: '🧴',
      TINTE: '🎨',
      CERA: '💈',
      TOALLA: '🧺',
      TIJERAS: '✂️',
      MAQUINA: '🪒',
      OTRO: '📦'
    };
    return iconos[categoria] || '📦';
  }

  getStockClase(producto: any): string {
    if (producto.stockActual === 0) return 'stock-critico';
    if (producto.stockBajo) return 'stock-bajo';
    return '';
  }
}
