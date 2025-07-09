import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

declare var Razorpay: any; 

@Component({
  selector: 'app-view-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './view-cart.component.html',
  styleUrls: ['./view-cart.component.css'],
  animations: [
    trigger('fadeSlideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ViewCartComponent implements OnInit {
  userId: number = 0;
  cart: any[] = [];
  orderId: string = '';
  showCheckoutModal: number | null = null;
  showConfirmModal: number | null = null;
  showSuccessModal = false;
  addresses: any[] = [];
  selectedAddressId: number | null = null;
  paymentMethod = 'cod';

  coupons: any[] = [];
  eligibleCoupons: any[] = [];
  selectedCouponId: number | null = null;
  appliedDiscount: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const user = sessionStorage.getItem('loggedInUser');
    if (user) {
      this.userId = JSON.parse(user).id;
      this.fetchCart();
      this.fetchAddresses();
      this.fetchCoupons();
    }
  }

  fetchCart(): void {
    this.http.get<any[]>(`http://localhost:5169/api/CartItem/summary/${this.userId}`).subscribe({
      next: res => this.cart = res || [],
      error: err => console.error('❌ Error fetching cart:', err)
    });
  }

  fetchAddresses(): void {
    this.http.get<any[]>(`http://localhost:5169/api/User/${this.userId}/addresses`).subscribe({
      next: res => this.addresses = res,
      error: err => console.error('❌ Error fetching addresses:', err)
    });
  }

  fetchCoupons(): void {
    this.http.get<any[]>(`http://localhost:5169/api/Coupon`).subscribe({
      next: res => this.coupons = res,
      error: err => console.error('❌ Error fetching coupons:', err)
    });
  }

  getTotal(group: any): number {
    return group?.items?.reduce((total: number, item: any) => total + (item.unitPrice || 0) * (item.quantity || 0), 0) || 0;
  }

  getDiscountedTotal(group: any): number {
    const total = this.getTotal(group);
    const coupon = this.eligibleCoupons.find(c => c.id === this.selectedCouponId);
    if (!coupon) return total;
    return Math.max(0, total - coupon.discountAmount);
  }

  applyCoupon(): void {
    const group = this.getCartGroupById(this.showCheckoutModal!);
    if (!group) return;
    const before = this.getTotal(group);
    const after = this.getDiscountedTotal(group);
    this.appliedDiscount = before - after;
  }

  increaseQuantity(group: any, itemId: number): void {
    const item = group.items.find((i: any) => i.id === itemId);
    if (!item) return;
    const newQty = item.quantity + 1;
    this.http.put(`http://localhost:5169/api/CartItem/${item.id}/quantity`, newQty).subscribe({
      next: () => this.fetchCart(),
      error: err => console.error('❌ Error updating quantity:', err)
    });
  }

  decreaseQuantity(group: any, itemId: number): void {
    const item = group.items.find((i: any) => i.id === itemId);
    if (!item) return;
    const newQty = item.quantity - 1;
    if (newQty <= 0) {
      this.http.delete(`http://localhost:5169/api/CartItem/${item.id}`).subscribe({
        next: () => this.fetchCart(),
        error: err => console.error('❌ Error deleting item:', err)
      });
    } else {
      this.http.put(`http://localhost:5169/api/CartItem/${item.id}/quantity`, newQty).subscribe({
        next: () => this.fetchCart(),
        error: err => console.error('❌ Error updating quantity:', err)
      });
    }
  }

  confirmRemove(restaurantId: number): void {
    this.showConfirmModal = restaurantId;
  }

  cancelRemove(): void {
    this.showConfirmModal = null;
  }

  removeRestaurant(restaurantId: number): void {
    const group = this.cart.find(c => c.restaurantId === restaurantId);
    if (!group || !group.items) return;
    const deleteRequests = group.items.map((item: any) =>
      this.http.delete(`http://localhost:5169/api/CartItem/${item.id}`).toPromise()
    );
    Promise.all(deleteRequests).then(() => {
      this.fetchCart();
      this.cancelRemove();
    });
  }

  proceedToCheckout(group: any): void {
    this.showCheckoutModal = group.restaurantId;
    this.paymentMethod = 'cod';
    this.selectedCouponId = null;
    this.appliedDiscount = 0;
    this.orderId = Math.floor(Math.random() * 900000 + 100000).toString();

    const total = this.getTotal(group);
    const now = new Date();
    const defaultAddress = this.addresses.find(addr => addr.isDefault);
    this.selectedAddressId = defaultAddress ? defaultAddress.id : null;

    this.eligibleCoupons = this.coupons.filter(coupon => {
      if (coupon.condition === 'date' && new Date(coupon.expirationDate) < now) return false;
      if (coupon.condition === 'minPrice' && total < coupon.minOrderAmount) return false;
      return true;
    });
  }

  getCartGroupById(restaurantId: number): any {
    return this.cart.find(c => c.restaurantId === restaurantId);
  }

  closeCheckoutModal(): void {
    this.showCheckoutModal = null;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.fetchCart();
  }

  placeOrder(group: any): void {
    const selectedAddressObj = this.addresses.find(addr => addr.id === Number(this.selectedAddressId));
    if (!selectedAddressObj) {
      console.error('❌ No valid address selected.');
      return;
    }

    const validOrderItems = group.items
      .filter((item: any) => {
        const id = item.menuItem?.id ?? item.menuItemId;
        return typeof id === 'number' && !isNaN(id);
      })
      .map((item: any) => ({
        menuItemId: item.menuItem?.id ?? item.menuItemId,
        quantity: item.quantity,
        price: +item.unitPrice || 0
      }));

    const finalTotal = this.getDiscountedTotal(group);

    const payload = {
      userId: this.userId,
      restaurantId: group.restaurantId,
      orderDate: new Date().toISOString(),
      totalAmount: finalTotal,
      status: 'Placed',
      address: selectedAddressObj.line,
      paymentMethod: this.paymentMethod,
      couponId: this.selectedCouponId,
      orderItems: validOrderItems
    };

    if (this.paymentMethod === 'cod') {
      this.submitOrder(payload, group);
    } else {
      this.launchRazorpay(finalTotal, payload, group);
    }
  }

  submitOrder(payload: any, group: any): void {
    this.http.post('http://localhost:5169/api/Order', payload).subscribe({
      next: () => {
        this.showCheckoutModal = null;
        this.showSuccessModal = true;
        const deleteRequests = group.items.map((item: any) =>
          this.http.delete(`http://localhost:5169/api/CartItem/${item.id}`).toPromise()
        );
        Promise.all(deleteRequests).then(() => this.fetchCart());
      },
      error: err => {
        console.error('❌ Failed to place order:', err);
      }
    });
  }

  launchRazorpay(amount: number, payload: any, group: any): void {
    if (typeof Razorpay === 'undefined') {
      alert('❌ Razorpay SDK not loaded. Check your internet connection or index.html.');
      return;
    }

    const razorpayOptions = {
      key: 'rzp_test_4sk0xjOoaG8AMK', 
      amount: amount * 100,
      currency: 'INR',
      name: 'Food Ordering App',
      description: 'Order Payment',
      handler: (response: any) => {
        console.log('✅ Razorpay Success:', response);
        payload.paymentId = response.razorpay_payment_id;
        payload.status = 'Paid';
        this.submitOrder(payload, group);
      },
      prefill: {
        name: 'User ' + this.userId,
        email: '',
        contact: ''
      },
      theme: {
        color: '#F37254'
      }
    };

    const rzp = new Razorpay(razorpayOptions);
    rzp.open();
  }
}
