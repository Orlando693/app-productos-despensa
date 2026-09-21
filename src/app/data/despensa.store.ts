import { Injectable, computed, signal } from '@angular/core';
import { Product, ShoppingList } from '../models/despensa.models';

const STORAGE_KEY = 'despensa-state-v1';

const seedLists: ShoppingList[] = [
  {
    id: 1,
    name: 'Supermercado',
    description: 'Compras semanales para la casa',
    updatedAt: new Date().toISOString(),
    products: [
      { id: 1, name: 'Leche', purchased: false, updatedAt: new Date().toISOString() },
      { id: 2, name: 'Pan', purchased: false, updatedAt: new Date().toISOString() },
      { id: 3, name: 'Huevos', purchased: true, updatedAt: new Date().toISOString() },
    ],
  },
  {
    id: 2,
    name: 'Mercado',
    description: 'Frutas y verduras',
    updatedAt: new Date().toISOString(),
    products: [
      { id: 4, name: 'Tomate', purchased: false, updatedAt: new Date().toISOString() },
      { id: 5, name: 'Manzanas', purchased: false, updatedAt: new Date().toISOString() },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class DespensaStore {
  private readonly _lists = signal<ShoppingList[]>(this.read());
  private readonly _selectedListId = signal<number | null>(null);

  readonly lists = this._lists.asReadonly();
  readonly selectedListId = this._selectedListId.asReadonly();
  readonly selectedList = computed(() =>
    this._lists().find(list => list.id === this._selectedListId()) ?? null
  );
  readonly recentProducts = computed(() => {
    const seen = new Set<string>();
    return this._lists()
      .flatMap(list => list.products)
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter(product => {
        const key = product.name.trim().toLocaleLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(product => product.name);
  });

  selectList(id: number) {
    this._selectedListId.set(id);
  }

  createList(name: string, description: string) {
    const now = new Date().toISOString();
    const list: ShoppingList = {
      id: Date.now(),
      name: name.trim(),
      description: description.trim(),
      products: [],
      updatedAt: now,
    };

    this._lists.update(lists => [list, ...lists]);
    this._selectedListId.set(list.id);
    this.persist();
    return list;
  }

  pendingCount(list: ShoppingList) {
    return list.products.filter(product => !product.purchased).length;
  }

  addProduct(listId: number, name: string) {
    const cleanName = name.trim();
    if (!cleanName) return;

    const now = new Date().toISOString();
    const product: Product = {
      id: Date.now(),
      name: cleanName,
      purchased: false,
      updatedAt: now,
    };

    this._lists.update(lists => lists.map(list =>
      list.id === listId
        ? { ...list, updatedAt: now, products: [...list.products, product] }
        : list
    ));
    this.persist();
  }

  addProductsToList(listId: number, names: string[]) {
    const cleanNames = names.map(name => name.trim()).filter(Boolean);
    if (!cleanNames.length) return;

    const now = new Date().toISOString();
    this._lists.update(lists => lists.map(list => {
      if (list.id !== listId) return list;

      const products = cleanNames.map((name, index) => ({
        id: Date.now() + index,
        name,
        purchased: false,
        updatedAt: now,
      }));

      return { ...list, updatedAt: now, products: [...list.products, ...products] };
    }));
    this.persist();
  }

  updateProduct(listId: number, productId: number, name: string) {
    const cleanName = name.trim();
    if (!cleanName) return;
    const now = new Date().toISOString();

    this._lists.update(lists => lists.map(list =>
      list.id === listId
        ? {
            ...list,
            updatedAt: now,
            products: list.products.map(product =>
              product.id === productId ? { ...product, name: cleanName, updatedAt: now } : product
            ),
          }
        : list
    ));
    this.persist();
  }

  toggleProduct(listId: number, productId: number) {
    const now = new Date().toISOString();
    this._lists.update(lists => lists.map(list =>
      list.id === listId
        ? {
            ...list,
            updatedAt: now,
            products: list.products.map(product =>
              product.id === productId
                ? { ...product, purchased: !product.purchased, updatedAt: now }
                : product
            ),
          }
        : list
    ));
    this.persist();
  }

  deleteProduct(listId: number, productId: number) {
    const now = new Date().toISOString();
    this._lists.update(lists => lists.map(list =>
      list.id === listId
        ? { ...list, updatedAt: now, products: list.products.filter(product => product.id !== productId) }
        : list
    ));
    this.persist();
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._lists()));
  }

  private read(): ShoppingList[] {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value ? JSON.parse(value) as ShoppingList[] : seedLists;
    } catch {
      return seedLists;
    }
  }
}
