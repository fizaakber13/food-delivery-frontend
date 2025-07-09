export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  menuItem: {
    id: number;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
  };
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  restaurantId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  address: string;
  paymentMethod: string;
  orderItems: OrderItem[];
}
