import { Component, input, output } from '@angular/core';

export type MainTab = 'listas' | 'recientes';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css',
})
export class BottomNavComponent {
  active = input<MainTab>('listas');
  navigate = output<MainTab>();
}
