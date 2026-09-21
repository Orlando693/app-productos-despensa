import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-list-card',
  standalone: true,
  templateUrl: './list-card.html',
  styleUrl: './list-card.css',
})
export class ListCardComponent {
  title = input.required<string>();
  description = input('');
  pendingCount = input(0);
  open = output<void>();
}
