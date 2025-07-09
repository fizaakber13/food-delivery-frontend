export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CartGroup {
  restaurantId: number;
  restaurantName: string;
  items: CartItem[];
}

export const CART: CartGroup[] = [];
