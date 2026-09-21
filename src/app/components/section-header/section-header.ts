import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  templateUrl: './section-header.html',
  styleUrl: './section-header.css',
})
export class SectionHeaderComponent {
  title = input.required<string>();
  count = input(0);
}
