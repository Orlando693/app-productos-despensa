import { Component, computed, signal } from '@angular/core';

interface Prod {
  id: number;
  nom: string;
  comp: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {

  private clave = 'productos';

  prods = signal<Prod[]>(this.cargar());

  pend = computed(() =>
    this.prods().filter(p => !p.comp)
  );

  comprados = computed(() =>
    this.prods().filter(p => p.comp)
  );

  agregar(inp: HTMLInputElement) {
    const nom = inp.value.trim();

    if (!nom) return;

    this.prods.update(lista => [
      ...lista,
      {
        id: Date.now(),
        nom,
        comp: false
      }
    ]);

    inp.value = '';

    this.guardar();
  }

  cambiar(id: number) {
    this.prods.update(lista =>
      lista.map(p =>
        p.id === id
          ? { ...p, comp: !p.comp }
          : p
      )
    );

    this.guardar();
  }

  eliminar(id: number) {
    this.prods.update(lista =>
      lista.filter(p => p.id !== id)
    );

    this.guardar();
  }

  limpiar() {
    this.prods.update(lista =>
      lista.filter(p => !p.comp)
    );

    this.guardar();
  }

  private cargar(): Prod[] {
    const datos = localStorage.getItem(this.clave);

    return datos
      ? JSON.parse(datos)
      : [];
  }

  private guardar() {
    localStorage.setItem(
      this.clave,
      JSON.stringify(this.prods())
    );
  }
}