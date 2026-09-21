import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  templateUrl: './bottom-sheet.html',
  styleUrl: './bottom-sheet.css',
})
export class BottomSheetComponent {
  open = input(false);
  title = input('');
  close = output<void>();
}
