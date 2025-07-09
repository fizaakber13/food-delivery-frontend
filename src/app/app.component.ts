import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showProfileModal = false;
  user: any = { name: '', email: '', contact: '', id: null };

  constructor(public router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const userData = sessionStorage.getItem('loggedInUser');
    if (userData) {
      try {
        this.user = JSON.parse(userData);

        
        if (this.router.url === '/' || this.router.url === '/login') {
          if (this.user.isAdmin) {
            this.router.navigate(['/admin']);
          } else if (this.user.isRestaurant) {
            this.router.navigate([`/restaurant-user/${this.user.id}`]);
          } else {
            this.router.navigate(['/customer/restaurants']);
          }
        }
      } catch (e) {
        console.error('Corrupt session data:', e);
      }
    }
  }

  isLoginPage(): boolean {
    return this.router.url.includes('login');
  }

  fetchUserDetails(): void {
    if (!this.user.id) return;

    const isRestaurant = this.user.isRestaurant;

    if (isRestaurant) {
      this.http.get<any>(`http://localhost:5169/api/Restaurant/${this.user.id}`).subscribe({
        next: (data) => {
          this.user = {
            id: data.id,
            name: data.name,
            email: data.email,
            contact: data.contact,
            isRestaurant: true
          };
          sessionStorage.setItem('loggedInUser', JSON.stringify(this.user));
        }
      });
    } else {
      this.http.get<any>(`http://localhost:5169/api/User/${this.user.id}`).subscribe({
        next: (data) => {
          this.user = {
            id: data.id,
            name: data.name,
            email: data.emailOrPhone,
            contact: data.phone ?? '',
            isAdmin: data.isAdmin
          };
          sessionStorage.setItem('loggedInUser', JSON.stringify(this.user));
        }
      });
    }
  }

  updateProfile(): void {
    if (!this.user.id) return;

    console.log('Updating profile with:', this.user);

    const payload = {
      id: this.user.id,
      name: this.user.name,
      emailOrPhone: this.user.email,
      phone: this.user.contact,
      isAdmin: false,
      addresses: []
    };

    this.http.put(`http://localhost:5169/api/User/${this.user.id}`, payload).subscribe({
      next: () => {
        console.log('Profile update success');
        alert('Profile updated successfully!');
        sessionStorage.setItem('loggedInUser', JSON.stringify(this.user));
        this.showProfileModal = false;
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Failed to update profile');
      }
    });
  }

  onSubmitProfileForm(): void {
    console.log('Form submitted');
    this.updateProfile();
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
