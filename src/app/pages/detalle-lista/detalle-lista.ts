import { Component, computed, input, output, signal } from '@angular/core';
import { Input } from '../../components/input/input';
import { ShoppingItem, ShoppingList } from '../../models';

@Component({
  selector: 'app-detalle-lista',
  standalone: true,
  imports: [Input],
  templateUrl: './detalle-lista.html',
  styleUrl: './detalle-lista.css',
})
export class DetalleLista {
  list = input.required<ShoppingList>();

  itemsChange = output<ShoppingItem[]>();
  back = output<void>();

  search = signal('');
  newItem = signal('');

  pending = computed(() => this.filteredItems().filter((item) => !item.purchased));
  purchased = computed(() => this.filteredItems().filter((item) => item.purchased));

  addItem(): void {
    const name = this.newItem().trim();
    if (!name) {
      return;
    }

    this.itemsChange.emit([
      ...this.list().items,
      { id: Date.now(), name, purchased: false },
    ]);
    this.newItem.set('');
  }

  toggleItem(id: number): void {
    this.itemsChange.emit(
      this.list().items.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item,
      ),
    );
  }

  deleteItem(id: number): void {
    this.itemsChange.emit(this.list().items.filter((item) => item.id !== id));
  }

  private filteredItems(): ShoppingItem[] {
    const term = this.search().trim().toLocaleLowerCase('es');
    return term
      ? this.list().items.filter((item) =>
          `${item.name} ${item.description ?? ''}`.toLocaleLowerCase('es').includes(term),
        )
      : this.list().items;
  }
}
