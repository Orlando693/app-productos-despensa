import { Component, input, output } from '@angular/core';

export type ProductRowState = 'pending' | 'purchased' | 'selectable';

@Component({
  selector: 'app-product-row',
  standalone: true,
  templateUrl: './product-row.html',
  styleUrl: './product-row.css',
})
export class ProductRowComponent {
  name = input.required<string>();
  state = input<ProductRowState>('pending');
  selected = input(false);
  showMenu = input(true);
  toggle = output<void>();
  menu = output<void>();
}
