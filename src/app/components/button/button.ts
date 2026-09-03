import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  disabled = input(false);
  type = input<'button' | 'submit'>('button');

  clicked = output<void>();
}
