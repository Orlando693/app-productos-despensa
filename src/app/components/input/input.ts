import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: true,
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class Input {
  private static nextId = 0;

  readonly inputId = `app-input-${Input.nextId++}`;

  label = input('');
  value = input('');
  placeholder = input('');
  disabled = input(false);
  required = input(false);
  error = input<string | null>(null);
  type = input<'text' | 'search'>('text');
  inputMode = input<'text' | 'search' | 'email' | 'numeric' | 'tel' | 'url'>('text');

  valueChange = output<string>();
  blurred = output<void>();

  updateValue(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
