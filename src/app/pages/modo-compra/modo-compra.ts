import { Component, computed, inject, output } from '@angular/core';
import { PageHeaderComponent } from '../../components/page-header/page-header';
import { ProductRowComponent } from '../../components/product-row/product-row';
import { ProgressSummaryComponent } from '../../components/progress-summary/progress-summary';
import { SectionHeaderComponent } from '../../components/section-header/section-header';
import { UiButtonComponent } from '../../components/ui-button/ui-button';
import { DespensaStore } from '../../data/despensa.store';
import { Product } from '../../models/despensa.models';

@Component({
  selector: 'app-modo-compra',
  standalone: true,
  imports: [PageHeaderComponent, ProductRowComponent, ProgressSummaryComponent, SectionHeaderComponent, UiButtonComponent],
  templateUrl: './modo-compra.html',
  styleUrl: './modo-compra.css',
})
export class ModoCompra {
  readonly store = inject(DespensaStore);
  finalizar = output<void>();
  volver = output<void>();

  readonly list = this.store.selectedList;
  readonly pending = computed(() => this.list()?.products.filter(product => !product.purchased) ?? []);
  readonly purchased = computed(() => this.list()?.products.filter(product => product.purchased) ?? []);
  readonly total = computed(() => this.list()?.products.length ?? 0);

  toggle(product: Product) {
    const list = this.list();
    if (list) this.store.toggleProduct(list.id, product.id);
  }
}
