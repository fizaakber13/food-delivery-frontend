export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  avgRating: number;
  category: string;
  price: number;
  description: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
     id: 1,
     restaurantId: 1,
     name: 'Margherita Pizza',
     avgRating: 4.2,
     category: 'Pizza',
     price: 299,
     description: 'Classic cheese and tomato pizza with mozzarella.'
  },
  {
    id: 2,
    restaurantId: 1,
    name: 'Veg Delight Pizza',
    avgRating: 4.0,
    category: 'Pizza',
    price: 349,
    description: 'Loaded with capsicum, onion, olives, and sweet corn.'
  },
  {
    id: 3,
    restaurantId: 2,
    name: 'Chicken Biryani',
    avgRating: 4.6,
    category: 'Rice',
    price: 199,
    description: 'Spicy biryani with tender chicken and flavorful rice.'
  },
  {
      id: 4,
      restaurantId: 2,
      name: 'Paneer Butter Masala',
      avgRating: 4.4,
      category: 'Curry',
      price: 179,
      description: 'Creamy tomato-based curry with paneer cubes.'
  }
];
