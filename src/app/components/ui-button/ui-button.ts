import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  templateUrl: './ui-button.html',
  styleUrl: './ui-button.css',
})
export class UiButtonComponent {
  variant = input<ButtonVariant>('primary');
  disabled = input(false);
  fullWidth = input(false);
  ariaLabel = input<string | null>(null);
  pressed = output<void>();
}
