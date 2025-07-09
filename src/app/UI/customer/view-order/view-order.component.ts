import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-view-order',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './view-order.component.html',
  styleUrls: ['./view-order.component.css'],
  animations: [
    trigger('fadeSlideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ViewOrderComponent implements OnInit {
  userId: number = 0;
  orders: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const user = sessionStorage.getItem('loggedInUser');
    if (user) {
      this.userId = JSON.parse(user).id;
      this.fetchOrders();
    }
  }

  fetchOrders(): void {
    this.http.get<any[]>(`http://localhost:5169/api/order/user/${this.userId}`).subscribe({
      next: res => {
        console.log('✅ Orders:', res);
        this.orders = res || [];
      },
      error: err => console.error('❌ Error fetching orders:', err)
    });
  }
  getStatusClass(status: string | undefined): string {
  if (!status) return 'placed';
  return status.toLowerCase().replace(/\s+/g, '-'); 
}

}
