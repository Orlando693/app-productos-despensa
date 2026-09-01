import { Component } from '@angular/core';
import { Listas } from './pages/listas/listas';
import { NuevaLista } from './pages/nueva-lista/nueva-lista';
import { DetalleLista } from './pages/detalle-lista/detalle-lista';

interface Prod {
  id: number;
  nom: string;
  comp: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Listas,
    NuevaLista,
    DetalleLista
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {

  vista = 'listas';

  cambiarVista(nombre:string){
    this.vista = nombre;
  }
  crearLista(lista: {
  nombre:string;
  descripcion:string;
}){

  console.log('Nueva lista:', lista);

  this.cambiarVista('detalle');

}
}