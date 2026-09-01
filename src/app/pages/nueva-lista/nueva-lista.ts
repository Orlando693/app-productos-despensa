import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nueva-lista',
  imports: [
    FormsModule
  ],
  templateUrl: './nueva-lista.html',
  styleUrl: './nueva-lista.css',
})
export class NuevaLista {

  volver = output<void>();

  crear = output<{
    nombre: string;
    descripcion: string;
  }>();


  nombre = '';
  descripcion = '';


  crearLista(){

    this.crear.emit({
      nombre: this.nombre,
      descripcion: this.descripcion
    });

  }


  cancelar(){

    this.volver.emit();

  }

}