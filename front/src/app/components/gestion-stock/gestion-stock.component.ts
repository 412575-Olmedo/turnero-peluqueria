import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MovimientoStockRequest, Producto, StockMovimiento, TipoMovimiento } from '../../models/models';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-gestion-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './gestion-stock.component.html',
  styleUrl: './gestion-stock.component.css'
})
export class GestionStockComponent implements OnInit {
  private productoService = inject(ProductoService);

  // Signals
  productos = this.productoService.productos;
  productosStockBajo = signal<Producto[]>([]);
  cargando = signal<boolean>(false);
  vistaActual = signal<'listado' | 'formulario' | 'historial'>('listado');
  productoSeleccionado = signal<Producto | null>(null);
  historialMovimientos = signal<StockMovimiento[]>([]);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);
  
  // Form para nuevo producto
  nuevoProducto: Producto = this.getProductoVacio();
  
  // Categorías disponibles
  categorias = ['SHAMPOO', 'TINTE', 'CERA', 'TOALLA', 'TIJERAS', 'MAQUINA', 'OTRO'];

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando.set(true);
    this.productoService.listarProductos().subscribe({
      next: () => {
        this.cargarStockBajo();
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.cargando.set(false);
      }
    });
  }

  cargarStockBajo(): void {
    this.productoService.listarStockBajo().subscribe({
      next: (productos) => this.productosStockBajo.set(productos)
    });
  }

  abrirModalNuevo(): void {
    this.mensaje.set(null);
    this.error.set(null);
    this.productoSeleccionado.set(null);
    this.nuevoProducto = this.getProductoVacio();
    this.vistaActual.set('formulario');
  }

  abrirModalEditar(producto: Producto): void {
    this.mensaje.set(null);
    this.error.set(null);
    this.productoSeleccionado.set(producto);
    this.nuevoProducto = { ...producto };
    this.vistaActual.set('formulario');
  }

  cerrarModal(): void {
    this.vistaActual.set('listado');
    this.productoSeleccionado.set(null);
  }

  guardarProducto(): void {
    this.mensaje.set(null);
    this.error.set(null);
    if (this.productoSeleccionado()) {
      // Actualizar
      this.productoService.actualizarProducto(this.productoSeleccionado()!.id!, this.nuevoProducto)
        .subscribe({
          next: () => {
            this.cerrarModal();
            this.cargarProductos();
            this.mensaje.set('Producto actualizado correctamente.');
          },
          error: (err) => this.error.set('No se pudo actualizar el producto: ' + (err.error?.message || 'error inesperado'))
        });
    } else {
      // Crear
      this.productoService.crearProducto(this.nuevoProducto).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarProductos();
          this.mensaje.set('Producto creado correctamente.');
        },
        error: (err) => this.error.set('No se pudo crear el producto: ' + (err.error?.message || 'error inesperado'))
      });
    }
  }

  eliminarProducto(producto: Producto): void {
    if (!confirm(`¿Eliminar ${producto.nombre}?`)) return;

    this.productoService.eliminarProducto(producto.id!).subscribe({
      next: () => {
        this.cargarProductos();
        this.mensaje.set('Producto eliminado correctamente.');
      },
      error: (err) => this.error.set('No se pudo eliminar: ' + (err.error?.message || 'error inesperado'))
    });
  }

  sumarStock(producto: Producto): void {
    const cantidad = parseInt(prompt('¿Cuántas unidades ingresan?', '1') || '0');
    if (cantidad <= 0) return;

    const motivo = prompt('Motivo (opcional):') || 'Entrada de stock';

    const movimiento: MovimientoStockRequest = {
      cantidad,
      tipo: TipoMovimiento.ENTRADA,
      motivo
    };

    this.productoService.registrarMovimiento(producto.id!, movimiento).subscribe({
      next: () => {
        this.cargarProductos();
        this.mensaje.set('Stock actualizado correctamente.');
      },
      error: (err) => this.error.set('No se pudo registrar el movimiento: ' + (err.error?.message || 'error inesperado'))
    });
  }

  restarStock(producto: Producto): void {
    const cantidad = parseInt(prompt(`Stock actual: ${producto.stockActual}. ¿Cuántas unidades salen?`, '1') || '0');
    if (cantidad <= 0) return;

    if (cantidad > producto.stockActual) {
      this.error.set('No hay suficiente stock para esa salida.');
      return;
    }

    const motivo = prompt('Motivo (opcional):') || 'Salida de stock';

    const movimiento: MovimientoStockRequest = {
      cantidad,
      tipo: TipoMovimiento.SALIDA,
      motivo
    };

    this.productoService.registrarMovimiento(producto.id!, movimiento).subscribe({
      next: () => {
        this.cargarProductos();
        this.mensaje.set('Stock actualizado correctamente.');
      },
      error: (err) => this.error.set('No se pudo registrar el movimiento: ' + (err.error?.message || 'error inesperado'))
    });
  }

  verHistorial(producto: Producto): void {
    this.productoSeleccionado.set(producto);
    this.productoService.obtenerHistorial(producto.id!).subscribe({
      next: (movimientos) => {
        this.historialMovimientos.set(movimientos);
        this.vistaActual.set('historial');
      }
    });
  }

  cerrarHistorial(): void {
    this.vistaActual.set('listado');
    this.historialMovimientos.set([]);
  }

  getStockClase(producto: Producto): string {
    if (producto.stockBajo) return 'stock-bajo';
    if (producto.stockActual <= producto.stockMinimo * 1.5) return 'stock-medio';
    return 'stock-bien';
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

  getTipoMovimientoTexto(tipo: TipoMovimiento): string {
    const textos: { [key in TipoMovimiento]: string } = {
      ENTRADA: 'Entrada',
      SALIDA: 'Salida',
      AJUSTE: 'Ajuste',
      MERMA: 'Merma'
    };
    return textos[tipo];
  }

  getTipoMovimientoClase(tipo: TipoMovimiento): string {
    return tipo === TipoMovimiento.ENTRADA || tipo === TipoMovimiento.AJUSTE ? 'positivo' : 'negativo';
  }

  private getProductoVacio(): Producto {
    return {
      nombre: '',
      descripcion: '',
      categoria: 'OTRO',
      stockActual: 0,
      stockMinimo: 5,
      unidad: 'und',
      activo: true
    };
  }

  protected readonly TipoMovimiento = TipoMovimiento;
}
