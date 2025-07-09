import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

interface Order {
  id: number;
  userId: number;
  restaurantId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  user?: { name: string };
  restaurant?: { name: string };
  orderItems: { menuItem: { name: string } }[];
}

interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
  animations: [
    trigger('fadeSlideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  searchText: string = '';
  users: User[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    
    this.http.get<User[]>('http://localhost:5169/api/User').subscribe(users => {
      this.users = users;

      this.http.get<Order[]>('http://localhost:5169/api/Order').subscribe(orders => {
        
        this.orders = orders.map(order => {
          const user = this.users.find(u => u.id === order.userId);
          return {
            ...order,
            user: { name: user?.name || 'Unknown' }
          };
        });
      });
    });
  }

  getFilteredOrders(): Order[] {
    const search = this.searchText.toLowerCase();
    return this.orders.filter(order =>
      order.id.toString().includes(search) ||
      (order.user?.name?.toLowerCase().includes(search)) ||
      (order.restaurant?.name?.toLowerCase().includes(search))
    );
  }

  updateStatus(orderId: number, newStatus: string): void {
  this.http.put(`http://localhost:5169/api/Order/${orderId}`, { status: newStatus })
    .subscribe(() => {
      const order = this.orders.find(o => o.id === orderId);
      if (order) order.status = newStatus;
    });
}


}
