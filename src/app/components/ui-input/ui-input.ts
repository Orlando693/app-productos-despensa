import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  templateUrl: './ui-input.html',
  styleUrl: './ui-input.css',
})
export class UiInputComponent {
  label = input('');
  placeholder = input('');
  value = input('');
  error = input('');
  disabled = input(false);
  multiline = input(false);
  valueChange = output<string>();
  enter = output<void>();

  onInput(event: Event) {
    this.valueChange.emit((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }
}
