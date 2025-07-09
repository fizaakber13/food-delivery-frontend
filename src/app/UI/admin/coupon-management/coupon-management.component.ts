import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Coupon {
  id: number;
  code: string;
  discountAmount: number;
  discountType: 'percentage' | 'flat';
  condition: 'date' | 'minPrice';
  minOrderAmount?: number | null;
  expirationDate?: string | null;
  isActive: boolean;
}

@Component({
  selector: 'app-coupon-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './coupon-management.component.html',
  styleUrls: ['./coupon-management.component.css'],
  animations: [
    trigger('fadeSlideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CouponManagementComponent implements OnInit {
  coupons: Coupon[] = [];
  searchText = '';
  showModal = false;
  editMode = false;
  couponToDelete: number | null = null;
  showDeleteConfirm = false;

  newCoupon: CouponFormModel = this.getEmptyCoupon();

  private readonly API_URL = 'http://localhost:5169/api/Coupon';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  getEmptyCoupon(): CouponFormModel {
    return {
      id: 0,
      code: '',
      discountAmount: 0,
      discountType: 'percentage',
      condition: 'date',
      minOrderAmount: null,
      expirationDate: '',
      isActive: true
    };
  }

  loadCoupons(): void {
    this.http.get<Coupon[]>(this.API_URL).subscribe(data => {
      this.coupons = data;
    });
  }

  getFilteredCoupons(): Coupon[] {
    return this.coupons.filter(c =>
      c.code.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  openAddModal(): void {
    this.newCoupon = this.getEmptyCoupon();
    this.editMode = false;
    this.showModal = true;
  }

  openEditModal(coupon: Coupon): void {
    this.newCoupon = {
      id: coupon.id,
      code: coupon.code,
      discountAmount: coupon.discountAmount,
      discountType: coupon.discountType,
      condition: coupon.condition,
      minOrderAmount: coupon.minOrderAmount ?? null,
      expirationDate: coupon.expirationDate?.split('T')[0] ?? '',
      isActive: coupon.isActive
    };
    this.editMode = true;
    this.showModal = true;
  }

  saveCoupon(): void {
  this.newCoupon.code = this.newCoupon.code.toUpperCase();

  
  if (
    !this.newCoupon.code ||
    !this.newCoupon.discountAmount ||
    !this.newCoupon.discountType ||
    !this.newCoupon.condition ||
    (this.newCoupon.condition === 'date' && !this.newCoupon.expirationDate) ||
    (this.newCoupon.condition === 'minPrice' && !this.newCoupon.minOrderAmount)
  ) {
    alert('Please fill in all required fields.');
    return;
  }

  
  const payload = {
    id: this.newCoupon.id,
    code: this.newCoupon.code,
    discountAmount: +this.newCoupon.discountAmount,
    discountType: this.newCoupon.discountType,
    condition: this.newCoupon.condition,
    minOrderAmount: this.newCoupon.condition === 'minPrice' ? +(this.newCoupon.minOrderAmount ?? 0) : null,
    expirationDate: this.newCoupon.condition === 'date' ? this.newCoupon.expirationDate : null,
    isActive: this.newCoupon.isActive
  };

  
  const request = this.editMode
    ? this.http.put(`http://localhost:5169/api/Coupon/${this.newCoupon.id}`, payload)
    : this.http.post(`http://localhost:5169/api/Coupon`, payload);

  request.subscribe({
    next: () => {
      this.showModal = false;
      this.loadCoupons();
    },
    error: (error) => {
  console.error('Failed to add/update coupon:', error);
  alert(`Failed to add/update coupon\n${error?.error?.message || 'Unknown error'}`);
}

  });
}




  confirmDelete(id: number): void {
    this.couponToDelete = id;
    this.showDeleteConfirm = true;
  }

  deleteCoupon(): void {
    this.http.delete(`${this.API_URL}/${this.couponToDelete}`).subscribe(() => {
      this.loadCoupons();
      this.showDeleteConfirm = false;
      this.couponToDelete = null;
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.couponToDelete = null;
  }

  toggleActive(coupon: Coupon): void {
  const updatedCoupon = {
    id: coupon.id,
    code: coupon.code,
    discountAmount: coupon.discountAmount,
    discountType: coupon.discountType,
    condition: coupon.condition,
    minOrderAmount: coupon.condition === 'minPrice' ? coupon.minOrderAmount : null,
    expirationDate: coupon.condition === 'date' ? coupon.expirationDate : null,
    isActive: !coupon.isActive,
    restaurantCoupons: []
  };

  this.http.put(`${this.API_URL}/${coupon.id}`, updatedCoupon).subscribe({
    next: () => {
      this.loadCoupons();  // refresh with latest state
    },
    error: (err) => {
      console.error('Failed to update active state', err);
      alert('Failed to update active state');
    }
  });
}

}

type CouponFormModel = {
  id: number;
  code: string;
  discountAmount: number;
  discountType: 'percentage' | 'flat';
  condition: 'date' | 'minPrice';
  minOrderAmount: number | null;
  expirationDate: string;
  isActive: boolean;
};
