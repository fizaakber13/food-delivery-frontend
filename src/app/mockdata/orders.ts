export interface Order {
  id: number;
  customerName: string;
  restaurantName: string;
  items: string[];  
  totalAmount: number;
  status: 'Ordered' | 'Preparing' | 'On the Way' | 'Delivered';
}

export const ORDERS: Order[] = [
  {
    id: 101,
    customerName: 'Fiza Akbar',
    restaurantName: 'Restaurant1',
    items: ['Paneer Tikka', 'Butter Naan'],
    totalAmount: 450,
    status: 'Ordered'
  },
  {
    id: 102,
    customerName: 'Rehan Shah',
    restaurantName: 'Restaurant2',
    items: ['Cheese Burger', 'Fries'],
    totalAmount: 320,
    status: 'Preparing'
  }
];
