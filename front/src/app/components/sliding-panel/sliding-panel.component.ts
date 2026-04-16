import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Componente genérico de panel deslizable para reemplazar modales
 * Proporciona mejor UX en dispositivos móviles
 */
@Component({
  selector: 'app-sliding-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="sliding-panel-overlay" 
      [class.active]="isOpen"
      (click)="close()"
      [@fadeIn]="isOpen ? 'visible' : 'hidden'">
      
      <div 
        class="sliding-panel" 
        [class.active]="isOpen"
        (click)="$event.stopPropagation()"
        [@slideIn]="isOpen ? 'visible' : 'hidden'">
        
        <div class="panel-header">
          <button class="btn-back" (click)="close()" aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h2 class="panel-title">{{ title }}</h2>
          <button class="btn-close" (click)="close()" aria-label="Cerrar">✕</button>
        </div>

        <div class="panel-content">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sliding-panel-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .sliding-panel-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .sliding-panel {
      position: absolute;
      right: -100%;
      top: 0;
      bottom: 0;
      width: 90%;
      max-width: 600px;
      background: white;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sliding-panel.active {
      right: 0;
    }

    .panel-header {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 60px;
    }

    .panel-title {
      flex: 1;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 1rem;
      text-align: center;
    }

    .btn-back,
    .btn-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .btn-back:hover,
    .btn-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .btn-back {
      margin-right: auto;
    }

    .btn-close {
      margin-left: auto;
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    /* Estilos responsive */
    @media (min-width: 768px) {
      .sliding-panel {
        width: 500px;
      }

      .btn-back {
        display: none;
      }
    }

    @media (max-width: 767px) {
      .sliding-panel {
        width: 100%;
        max-width: none;
      }

      .btn-close {
        display: none;
      }
    }

    /* Scroll suave */
    .panel-content::-webkit-scrollbar {
      width: 8px;
    }

    .panel-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .panel-content::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    .panel-content::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `],
  animations: [
    trigger('fadeIn', [
      state('hidden', style({ opacity: 0, visibility: 'hidden' })),
      state('visible', style({ opacity: 1, visibility: 'visible' })),
      transition('hidden <=> visible', animate('300ms ease-in-out'))
    ]),
    trigger('slideIn', [
      state('hidden', style({ right: '-100%' })),
      state('visible', style({ right: 0 })),
      transition('hidden <=> visible', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ])
  ]
})
export class SlidingPanelComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Output() onClose = new EventEmitter<void>();

  close() {
    this.onClose.emit();
  }
}
