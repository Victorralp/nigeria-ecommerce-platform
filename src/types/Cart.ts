import { Product } from './Product';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string | number;
  quantity: number;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  total: number;
  loading: boolean;
  addItem: (product: Product) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}