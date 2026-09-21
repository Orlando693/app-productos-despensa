import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Product, ShoppingList } from '../models/despensa.models';

@Injectable({ providedIn: 'root' })
export class DespensaStore {
  private readonly http = inject(HttpClient);
  private readonly _lists = signal<ShoppingList[]>([]);
  private readonly _selectedListId = signal<number | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal('');

  readonly lists = this._lists.asReadonly();
  readonly selectedListId = this._selectedListId.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
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

  constructor() {
    void this.refresh();
  }

  async refresh() {
    this._loading.set(true);
    this._error.set('');
    try {
      const lists = await firstValueFrom(this.http.get<ShoppingList[]>('/api/lists'));
      this._lists.set(lists);
      const selectedId = this._selectedListId();
      if (selectedId !== null && !lists.some(list => list.id === selectedId)) {
        this._selectedListId.set(null);
      }
    } catch {
      this._error.set('No se pudo conectar con el servidor.');
    } finally {
      this._loading.set(false);
    }
  }

  selectList(id: number) {
    this._selectedListId.set(id);
  }

  async createList(name: string, description: string) {
    const list = await firstValueFrom(this.http.post<ShoppingList>('/api/lists', {
      name: name.trim(),
      description: description.trim(),
    }));
    this._lists.update(lists => [list, ...lists]);
    this._selectedListId.set(list.id);
    return list;
  }

  pendingCount(list: ShoppingList) {
    return list.products.filter(product => !product.purchased).length;
  }

  async addProduct(listId: number, name: string) {
    const cleanName = name.trim();
    if (!cleanName) return;
    const product = await firstValueFrom(
      this.http.post<Product>(`/api/lists/${listId}/products`, { name: cleanName })
    );
    this.patchList(listId, list => ({ ...list, products: [...list.products, product], updatedAt: product.updatedAt }));
  }

  async addProductsToList(listId: number, names: string[]) {
    const cleanNames = names.map(name => name.trim()).filter(Boolean);
    if (!cleanNames.length) return;
    const products = await firstValueFrom(
      this.http.post<Product[]>(`/api/lists/${listId}/products/bulk`, { names: cleanNames })
    );
    const updatedAt = products.at(-1)?.updatedAt ?? new Date().toISOString();
    this.patchList(listId, list => ({ ...list, products: [...list.products, ...products], updatedAt }));
  }

  async updateProduct(listId: number, productId: number, name: string) {
    const cleanName = name.trim();
    if (!cleanName) return;
    const updated = await firstValueFrom(
      this.http.patch<Product>(`/api/products/${productId}`, { name: cleanName })
    );
    this.patchProduct(listId, updated);
  }

  async toggleProduct(listId: number, productId: number) {
    const product = this._lists()
      .find(list => list.id === listId)
      ?.products.find(item => item.id === productId);
    if (!product) return;

    const updated = await firstValueFrom(
      this.http.patch<Product>(`/api/products/${productId}`, { purchased: !product.purchased })
    );
    this.patchProduct(listId, updated);
  }

  async deleteProduct(listId: number, productId: number) {
    await firstValueFrom(this.http.delete<void>(`/api/products/${productId}`));
    this.patchList(listId, list => ({
      ...list,
      products: list.products.filter(product => product.id !== productId),
      updatedAt: new Date().toISOString(),
    }));
  }

  private patchProduct(listId: number, updated: Product) {
    this.patchList(listId, list => ({
      ...list,
      updatedAt: updated.updatedAt,
      products: list.products.map(product => product.id === updated.id ? updated : product),
    }));
  }

  private patchList(listId: number, updater: (list: ShoppingList) => ShoppingList) {
    this._lists.update(lists => lists.map(list => list.id === listId ? updater(list) : list));
  }
}
