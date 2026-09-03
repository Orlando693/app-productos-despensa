import { Component, HostListener } from '@angular/core';
import { Listas } from './pages/listas/listas';
import { NuevaLista } from './pages/nueva-lista/nueva-lista';
import { DetalleLista } from './pages/detalle-lista/detalle-lista';
import { ShoppingItem, ShoppingList } from './models';

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
  private readonly storageKey = 'shopping-lists-v1';

  view: 'lists' | 'new-list' | 'list-detail' = 'lists';
  lists = this.loadLists();
  selectedListId: number | null = null;

  constructor() {
    const state = history.state as { view?: string; listId?: number } | null;

    if (state?.view === 'list-detail' && this.lists.some((list) => list.id === state.listId)) {
      this.selectedListId = state.listId ?? null;
      this.view = 'list-detail';
      return;
    }

    if (state?.view === 'new-list') {
      this.view = 'new-list';
      return;
    }

    history.replaceState({ view: 'lists' }, '');
  }

  get selectedList(): ShoppingList | undefined {
    return this.lists.find((list) => list.id === this.selectedListId);
  }

  backToLists(): void {
    if (history.state?.view && history.state.view !== 'lists') {
      history.back();
      return;
    }

    this.showLists();
  }

  showLists(): void {
    this.view = 'lists';
    this.selectedListId = null;
  }

  showNewList(): void {
    history.pushState({ view: 'new-list' }, '');
    this.view = 'new-list';
  }

  openList(id: number, replaceHistory = false): void {
    const method = replaceHistory ? 'replaceState' : 'pushState';
    history[method]({ view: 'list-detail', listId: id }, '');
    this.selectedListId = id;
    this.view = 'list-detail';
  }

  createList(list: { name: string; description: string }): void {
    const newList: ShoppingList = {
      id: Date.now(),
      name: list.name.trim(),
      description: list.description.trim(),
      items: [],
    };

    this.lists = [...this.lists, newList];
    this.saveLists();
    this.openList(newList.id, true);
  }

  @HostListener('window:popstate', ['$event'])
  handleHistoryNavigation(event: PopStateEvent): void {
    const state = event.state as { view?: string; listId?: number } | null;

    if (state?.view === 'list-detail' && this.lists.some((list) => list.id === state.listId)) {
      this.selectedListId = state.listId ?? null;
      this.view = 'list-detail';
      return;
    }

    if (state?.view === 'new-list') {
      this.view = 'new-list';
      return;
    }

    this.showLists();
  }

  updateItems(items: ShoppingItem[]): void {
    if (this.selectedListId === null) {
      return;
    }

    this.lists = this.lists.map((list) =>
      list.id === this.selectedListId ? { ...list, items } : list,
    );
    this.saveLists();
  }

  private loadLists(): ShoppingList[] {
    try {
      const savedLists = localStorage.getItem(this.storageKey);

      if (savedLists) {
        const parsed = JSON.parse(savedLists) as ShoppingList[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }

      const legacyProducts = localStorage.getItem('productos');
      const parsedProducts = legacyProducts
        ? (JSON.parse(legacyProducts) as { id: number; nom: string; comp: boolean }[])
        : null;

      return [
        {
          id: 1,
          name: 'Supermercado',
          description: 'Compras semanales para la casa',
          items: Array.isArray(parsedProducts)
            ? parsedProducts.map((product) => ({
                id: product.id,
                name: product.nom,
                purchased: product.comp,
              }))
            : [
                { id: 1, name: 'Leche', purchased: false },
                { id: 2, name: 'Pan', purchased: false },
                { id: 3, name: 'Huevos', purchased: true },
              ],
        },
        {
          id: 2,
          name: 'Mercado',
          description: 'Frutas y verduras',
          items: [],
        },
      ];
    } catch {
      return [];
    }
  }

  private saveLists(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.lists));
  }
}
