import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { User, Address } from '../../../models/user.model';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  animations: [
    trigger('fadeSlideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AccountComponent implements OnInit {
  user: User = {
    id: 0,
    name: '',
    emailOrPhone: '',
    isAdmin: false,
    addresses: [],
    cartItems: [],
    orders: []
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      this.user.id = parsed.id;
      this.user.name = parsed.name;
      this.user.emailOrPhone = parsed.emailOrPhone ?? parsed.email;
      this.user.isAdmin = parsed.isAdmin;

      this.http.get<Address[]>(`http://localhost:5169/api/User/${this.user.id}/addresses`)
        .subscribe({
          next: (res) => this.user.addresses = res,
          error: (err) => console.error('❌ Failed to fetch addresses:', err)
        });
    }
  }

  addAddressField(): void {
    this.user.addresses.push({
      label: 'Other',
      line: '',
      isDefault: false,
      userId: this.user.id
    });
  }

  removeAddressField(index: number): void {
    const confirmed = confirm("Are you sure you want to remove this address?");
    if (confirmed && this.user.addresses.length > 1) {
      this.user.addresses.splice(index, 1);
      this.updateProfile(); 
    }
  }

  setDefaultAddress(index: number): void {
    this.user.addresses.forEach((addr, i) => {
      addr.isDefault = i === index;
    });
  }

  updateProfile(): void {
    console.log("📦 Sending updated profile:", this.user);

    this.http.put(`http://localhost:5169/api/User/${this.user.id}`, this.user)
      .subscribe({
        next: () => {
          alert('✅ Profile updated successfully!');
          sessionStorage.setItem('loggedInUser', JSON.stringify(this.user));
        },
        error: (err) => {
          console.error('❌ Failed to update profile:', err);
          alert('Failed to update profile');
        }
      });
  }

  trackByIndex(index: number): number {
    return index;
  }
}
