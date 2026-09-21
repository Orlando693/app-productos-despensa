import { Component, output } from '@angular/core';
import { PageHeaderComponent } from '../../components/page-header/page-header';
import { UiButtonComponent } from '../../components/ui-button/ui-button';
import { UiInputComponent } from '../../components/ui-input/ui-input';

@Component({
  selector: 'app-nueva-lista',
  standalone: true,
  imports: [PageHeaderComponent, UiButtonComponent, UiInputComponent],
  templateUrl: './nueva-lista.html',
  styleUrl: './nueva-lista.css',
})
export class NuevaLista {
  volver = output<void>();
  crear = output<{ nombre: string; descripcion: string }>();

  nombre = '';
  descripcion = '';
  error = '';

  crearLista() {
    if (!this.nombre.trim()) {
      this.error = 'Escribe un nombre para la lista.';
      return;
    }

    this.crear.emit({ nombre: this.nombre, descripcion: this.descripcion });
  }
}
