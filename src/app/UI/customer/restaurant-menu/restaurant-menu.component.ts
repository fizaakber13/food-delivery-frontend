import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { Restaurant } from '../../../models/restaurant.model';
import { MenuItem } from '../../../models/menuitem.model';

@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './restaurant-menu.component.html',
  styleUrls: ['./restaurant-menu.component.css'],
  animations: [
    trigger('fadeSlideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class RestaurantMenuComponent implements OnInit {
  restaurant: Restaurant | undefined;
  menuItems: MenuItem[] = [];
  cartItems: any[] = [];
  searchText: string = '';
  userId: number = 0;
  cartLoaded: boolean = false;
  quantities: { [menuItemId: number]: number } = {};
  addedToCart: { [menuItemId: number]: boolean } = {};

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const user = sessionStorage.getItem('loggedInUser');
    if (user) {
      const userData = JSON.parse(user);
      this.userId = userData.id;
    } else {
      console.error('❌ No logged-in user found');
      return;
    }

    const restaurantId = Number(this.route.snapshot.paramMap.get('id'));

    this.http.get<Restaurant>(`http://localhost:5169/api/Restaurant/${restaurantId}`).subscribe({
      next: res => this.restaurant = res,
      error: err => console.error('Error loading restaurant:', err)
    });

    this.http.get<MenuItem[]>(`http://localhost:5169/api/MenuItem`).subscribe({
      next: res => {
        this.menuItems = res.filter(item => item.restaurantId === restaurantId);
        this.menuItems.forEach(item => {
          this.quantities[item.id] = 1;
        });
      },
      error: err => console.error('Error loading menu items:', err)
    });

    this.fetchCart();
  }

  fetchCart(): void {
    this.http.get<any[]>(`http://localhost:5169/api/CartItem/user/${this.userId}`).subscribe({
      next: res => {
        this.cartItems = res;
        this.cartLoaded = true;
      },
      error: err => console.error('Error fetching cart items:', err)
    });
  }

  getQuantity(menuItemId: number): number {
    const item = this.cartItems.find(ci => ci.menuItem?.id === menuItemId);
    return item ? item.quantity : 0;
  }

  getCartItemId(menuItemId: number): number | null {
    const item = this.cartItems.find(ci => ci.menuItem?.id === menuItemId);
    return item ? item.id : null;
  }

  changeLocalQuantity(menuItemId: number, delta: number): void {
    const current = this.quantities[menuItemId] || 1;
    const updated = current + delta;
    if (updated >= 1) this.quantities[menuItemId] = updated;
  }

  addToCart(item: MenuItem): void {
    if (!this.restaurant || this.userId <= 0) return;

    const quantity = this.quantities[item.id] || 1;

    const cartItem = {
      menuItemId: item.id,
      restaurantId: this.restaurant.id,
      userId: this.userId,
      quantity: quantity
    };

    this.http.post('http://localhost:5169/api/CartItem', cartItem).subscribe({
      next: () => {
        this.fetchCart();
        this.addedToCart[item.id] = true;

        setTimeout(() => {
          this.addedToCart[item.id] = false;
        }, 2000);
      },
      error: err => {
        console.error('❌ Error adding to cart:', err);
        alert('Failed to add item. Please ensure you are logged in.');
      }
    });
  }

  filteredMenuItems(): MenuItem[] {
    return this.menuItems.filter(item =>
      item.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
