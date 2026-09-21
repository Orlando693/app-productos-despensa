import { Component, input, output } from '@angular/core';
import { UiButtonComponent } from '../ui-button/ui-button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [UiButtonComponent],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input('');
  showBack = input(false);
  showMenu = input(false);
  back = output<void>();
  menu = output<void>();
}
