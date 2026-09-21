import { Component, input, output } from '@angular/core';
import { UiButtonComponent } from '../ui-button/ui-button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [UiButtonComponent],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent {
  open = input(false);
  title = input('Confirmar');
  message = input('');
  confirmLabel = input('Confirmar');
  cancel = output<void>();
  confirm = output<void>();
}
