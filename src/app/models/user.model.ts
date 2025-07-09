export interface Address {
  id?: number;
  line: string;
  isDefault: boolean;
  label?: string;
  userId: number;
}

export interface User {
  id: number;
  name: string;
  emailOrPhone: string;
  isAdmin: boolean;
  addresses: Address[];
  cartItems: any[];  
  orders: any[];     
}
