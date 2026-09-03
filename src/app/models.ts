export interface ShoppingItem {
  id: number;
  name: string;
  description?: string;
  purchased: boolean;
}

export interface ShoppingList {
  id: number;
  name: string;
  description: string;
  items: ShoppingItem[];
}
