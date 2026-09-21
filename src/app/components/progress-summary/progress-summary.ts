import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-summary',
  standalone: true,
  templateUrl: './progress-summary.html',
  styleUrl: './progress-summary.css',
})
export class ProgressSummaryComponent {
  current = input(0);
  total = input(0);
  percent = computed(() => this.total() ? Math.round((this.current() / this.total()) * 100) : 0);
}
