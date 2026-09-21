import { Component, computed, inject, output, signal } from '@angular/core';
import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet';
import { PageHeaderComponent } from '../../components/page-header/page-header';
import { ProductRowComponent } from '../../components/product-row/product-row';
import { UiButtonComponent } from '../../components/ui-button/ui-button';
import { UiInputComponent } from '../../components/ui-input/ui-input';
import { DespensaStore } from '../../data/despensa.store';

@Component({
  selector: 'app-recientes',
  standalone: true,
  imports: [BottomSheetComponent, PageHeaderComponent, ProductRowComponent, UiButtonComponent, UiInputComponent],
  templateUrl: './recientes.html',
  styleUrl: './recientes.css',
})
export class Recientes {
  readonly store = inject(DespensaStore);
  abrirLista = output<number>();

  search = signal('');
  selected = signal<Set<string>>(new Set());
  chooseListOpen = signal(false);
  targetListId = signal<number | null>(null);

  readonly filtered = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    return this.store.recentProducts().filter(name => !query || name.toLocaleLowerCase().includes(query));
  });

  toggle(name: string) {
    const next = new Set(this.selected());
    next.has(name) ? next.delete(name) : next.add(name);
    this.selected.set(next);
  }

  openChooseList() {
    this.targetListId.set(this.store.lists()[0]?.id ?? null);
    this.chooseListOpen.set(true);
  }

  addToList() {
    const listId = this.targetListId();
    if (listId === null) return;
    this.store.addProductsToList(listId, [...this.selected()]);
    this.selected.set(new Set());
    this.chooseListOpen.set(false);
    this.abrirLista.emit(listId);
  }
}
