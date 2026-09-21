import { Component, computed, inject, output, signal } from '@angular/core';
import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';
import { PageHeaderComponent } from '../../components/page-header/page-header';
import { ProductRowComponent } from '../../components/product-row/product-row';
import { SectionHeaderComponent } from '../../components/section-header/section-header';
import { UiButtonComponent } from '../../components/ui-button/ui-button';
import { UiInputComponent } from '../../components/ui-input/ui-input';
import { DespensaStore } from '../../data/despensa.store';
import { Product } from '../../models/despensa.models';

type SheetMode = 'actions' | 'edit' | null;

@Component({
  selector: 'app-detalle-lista',
  standalone: true,
  imports: [
    BottomSheetComponent,
    ConfirmDialogComponent,
    PageHeaderComponent,
    ProductRowComponent,
    SectionHeaderComponent,
    UiButtonComponent,
    UiInputComponent,
  ],
  templateUrl: './detalle-lista.html',
  styleUrl: './detalle-lista.css',
})
export class DetalleLista {
  readonly store = inject(DespensaStore);
  volver = output<void>();
  empezarCompra = output<void>();

  readonly list = this.store.selectedList;
  readonly pending = computed(() => this.list()?.products.filter(product => !product.purchased) ?? []);
  readonly purchased = computed(() => this.list()?.products.filter(product => product.purchased) ?? []);

  newProductName = '';
  editName = '';
  sheetMode = signal<SheetMode>(null);
  selectedProduct = signal<Product | null>(null);
  confirmDelete = signal(false);

  addProduct() {
    const list = this.list();
    if (!list || !this.newProductName.trim()) return;
    this.store.addProduct(list.id, this.newProductName);
    this.newProductName = '';
  }

  toggle(product: Product) {
    const list = this.list();
    if (list) this.store.toggleProduct(list.id, product.id);
  }

  openActions(product: Product) {
    this.selectedProduct.set(product);
    this.sheetMode.set('actions');
  }

  openEdit() {
    const product = this.selectedProduct();
    if (!product) return;
    this.editName = product.name;
    this.sheetMode.set('edit');
  }

  saveEdit() {
    const list = this.list();
    const product = this.selectedProduct();
    if (!list || !product || !this.editName.trim()) return;
    this.store.updateProduct(list.id, product.id, this.editName);
    this.closeSheet();
  }

  askDelete() {
    this.sheetMode.set(null);
    this.confirmDelete.set(true);
  }

  deleteProduct() {
    const list = this.list();
    const product = this.selectedProduct();
    if (list && product) this.store.deleteProduct(list.id, product.id);
    this.confirmDelete.set(false);
    this.selectedProduct.set(null);
  }

  closeSheet() {
    this.sheetMode.set(null);
  }
}
