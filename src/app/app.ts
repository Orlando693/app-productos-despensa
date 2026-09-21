import { Component, inject } from '@angular/core';
import { BottomNavComponent, MainTab } from './components/bottom-nav/bottom-nav';
import { DespensaStore } from './data/despensa.store';
import { DetalleLista } from './pages/detalle-lista/detalle-lista';
import { Listas } from './pages/listas/listas';
import { ModoCompra } from './pages/modo-compra/modo-compra';
import { NuevaLista } from './pages/nueva-lista/nueva-lista';
import { Recientes } from './pages/recientes/recientes';

type View = 'listas' | 'nueva' | 'detalle' | 'compra' | 'recientes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BottomNavComponent, DetalleLista, Listas, ModoCompra, NuevaLista, Recientes],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  readonly store = inject(DespensaStore);
  vista: View = 'listas';

  cambiarVista(vista: View) {
    this.vista = vista;
  }

  abrirLista(id: number) {
    this.store.selectList(id);
    this.cambiarVista('detalle');
  }

  async crearLista(data: { nombre: string; descripcion: string }) {
    const list = await this.store.createList(data.nombre, data.descripcion);
    this.abrirLista(list.id);
  }

  navegar(tab: MainTab) {
    this.cambiarVista(tab);
  }
}
