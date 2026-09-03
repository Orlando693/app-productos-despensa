import { Component, computed, input, output, signal } from '@angular/core';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';
import { ShoppingList } from '../../models';

@Component({
  selector: 'app-listas',
  standalone: true,
  imports: [Button, Input],
  templateUrl: './listas.html',
  styleUrl: './listas.css',
})
export class Listas {
  lists = input.required<ShoppingList[]>();

  newList = output<void>();
  listSelected = output<number>();

  search = signal('');

  filteredLists = computed(() => {
    const term = this.search().trim().toLocaleLowerCase('es');
    return term
      ? this.lists().filter((list) => list.name.toLocaleLowerCase('es').includes(term))
      : this.lists();
  });
}
