import { Component, output } from '@angular/core';


@Component({
  selector: 'app-listas',
  standalone:true,
  imports:[],
  templateUrl:'./listas.html',
  styleUrl:'./listas.css'
})
export class Listas {

  nuevaLista = output<void>();


  abrirNuevaLista(){

    this.nuevaLista.emit();

  }

}