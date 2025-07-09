export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  restaurantId: number;
  quantity?: number;
}
