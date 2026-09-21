import { Component, inject } from '@angular/core';
import { BottomNavComponent, MainTab } from './components/bottom-nav/bottom-nav';
import { DespensaStore } from './data/despensa.store';
import { DetalleLista } from './pages/detalle-lista/detalle-lista';
import { Listas } from './pages/listas/listas';
import { NuevaLista } from './pages/nueva-lista/nueva-lista';

type View = 'listas' | 'nueva' | 'detalle';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BottomNavComponent, DetalleLista, Listas, NuevaLista],
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

  crearLista(data: { nombre: string; descripcion: string }) {
    const list = this.store.createList(data.nombre, data.descripcion);
    this.abrirLista(list.id);
  }

  navegar(tab: MainTab) {
    if (tab === 'listas') this.cambiarVista('listas');
  }
}
