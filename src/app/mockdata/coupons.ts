export interface Coupon {
  id: number;
  code: string;
  discount: number;
  type: 'percentage' | 'flat';
  conditionType: 'date' | 'minPrice';
  conditionValue: string;
  isActive: boolean;
  restaurantIds: number[];
}

export const COUPONS: Coupon[] = [
  {
    id: 1,
    code: 'SAVE10',
    discount: 10,
    type: 'percentage',
    conditionType: 'date',
    conditionValue: '2025-06-30',
    isActive: true,
    restaurantIds: []
  },
  {
    id: 2,
    code: 'FLAT50',
    discount: 50,
    type: 'flat',
    conditionType: 'minPrice',
    conditionValue: '200',
    isActive: true,
    restaurantIds: []
  }
];
