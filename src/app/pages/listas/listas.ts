import { Component, inject, output } from '@angular/core';
import { DespensaStore } from '../../data/despensa.store';
import { ListCardComponent } from '../../components/list-card/list-card';
import { PageHeaderComponent } from '../../components/page-header/page-header';
import { UiButtonComponent } from '../../components/ui-button/ui-button';

@Component({
  selector: 'app-listas',
  standalone: true,
  imports: [ListCardComponent, PageHeaderComponent, UiButtonComponent],
  templateUrl: './listas.html',
  styleUrl: './listas.css'
})
export class Listas {
  readonly store = inject(DespensaStore);
  nuevaLista = output<void>();
  abrirLista = output<number>();
}
