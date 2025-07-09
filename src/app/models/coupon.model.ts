export interface Coupon {
  id: number;
  code: string;
  discountAmount: number;
  discountType: 'percentage' | 'flat';
  conditionType: 'date' | 'minPrice';
  minOrderAmount?: number;
  expirationDate?: string;
  isActive: boolean;
}
