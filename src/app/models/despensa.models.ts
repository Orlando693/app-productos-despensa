export interface Product {
  id: number;
  name: string;
  purchased: boolean;
  updatedAt: string;
}

export interface ShoppingList {
  id: number;
  name: string;
  description: string;
  products: Product[];
  updatedAt: string;
}
