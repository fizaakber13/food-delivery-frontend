import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSignUp = false;
  name = '';
  emailOrPhone = '';
  enteredOtp = '';
  showOtpField = false;
  loading = false;

  
  showRestaurantModal = false;
  restName = '';
  restEmail = '';
  restContact = '';
  restLocation = '';

  constructor(private http: HttpClient, private router: Router) {}

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.resetForm();
  }

  resetForm(): void {
    this.name = '';
    this.emailOrPhone = '';
    this.enteredOtp = '';
    this.showOtpField = false;
  }

  requestOtp(): void {
    if (!this.emailOrPhone) {
      alert('Please enter your email.');
      return;
    }

    this.loading = true;

    this.http.post('http://localhost:5169/api/User/send-otp', {
      email: this.emailOrPhone
    }).subscribe({
      next: () => {
        this.showOtpField = true;
        this.loading = false;
        alert('OTP sent to your email.');
      },
      error: () => {
        this.loading = false;
        alert('Failed to send OTP.');
      }
    });
  }

  verifyOtp(): void {
    if (!this.enteredOtp) {
      alert('Please enter the OTP.');
      return;
    }

    this.loading = true;

    this.http.post<any>('http://localhost:5169/api/User/verify-otp', {
      email: this.emailOrPhone,
      otp: this.enteredOtp,
      mode: this.isSignUp ? 'signup' : 'login'
    }).subscribe({
      next: (res) => {
        if (this.isSignUp) {
          this.http.post<any>('http://localhost:5169/api/User/signup', {
            name: this.name,
            emailOrPhone: this.emailOrPhone
          }).subscribe({
            next: () => {
              this.http.get<any[]>(`http://localhost:5169/api/User`).subscribe({
                next: (users) => {
                  const newUser = users.find(u => u.emailOrPhone === this.emailOrPhone);
                  if (newUser) {
                    this.fetchAndStoreUser(newUser.id, newUser.isAdmin);
                  } else {
                    this.loading = false;
                    alert('Signup succeeded, but user data could not be fetched.');
                  }
                },
                error: () => {
                  this.loading = false;
                  alert('Failed to fetch user after signup');
                }
              });
            },
            error: (err) => {
              this.loading = false;
              alert('Signup failed: ' + (err.error?.message || 'Unknown error'));
            }
          });
        } else {
          
          this.http.get<any>(`http://localhost:5169/api/Restaurant/by-email/${this.emailOrPhone}`)
            .subscribe({
              next: (restaurant) => {
                const sessionUser = {
                  id: restaurant.id,
                  name: restaurant.name,
                  email: restaurant.email,
                  contact: restaurant.contact,
                  isRestaurant: true
                };
                sessionStorage.setItem('loggedInUser', JSON.stringify(sessionUser));
                localStorage.setItem('userId', restaurant.id.toString());
                this.loading = false;
                alert('Login Successful as Restaurant!');
                this.router.navigate([`/restaurant-user/${restaurant.id}`]);
              },
              error: () => {
                this.fetchAndStoreUser(res.id, res.isAdmin);
              }
            });
        }
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || 'Invalid OTP or verification failed.');
      }
    });
  }

  fetchAndStoreUser(id: number, isAdmin: boolean): void {
    this.http.get<any>(`http://localhost:5169/api/User/${id}`).subscribe({
      next: (userData) => {
        const sessionUser = {
          id: userData.id,
          name: userData.name,
          email: userData.emailOrPhone,
          contact: userData.phone ?? '',
          isAdmin: userData.isAdmin
        };

        sessionStorage.setItem('loggedInUser', JSON.stringify(sessionUser));
        localStorage.setItem('userId', id.toString());

        this.loading = false;
        alert('Login Successful!');
        this.router.navigate([isAdmin ? '/admin' : '/customer/restaurants']);
      },
      error: () => {
        this.loading = false;
        alert('Failed to fetch user data');
      }
    });
  }

  openRestaurantModal(): void {
    this.showRestaurantModal = true;
  }

  closeRestaurantModal(): void {
    this.showRestaurantModal = false;
    this.restName = '';
    this.restEmail = '';
    this.restContact = '';
    this.restLocation = '';
  }

  submitRestaurantRegistration(): void {
    if (!this.restName || !this.restEmail || !this.restContact || !this.restLocation) {
      alert('Please fill in all fields.');
      return;
    }

    this.loading = true;

    this.http.post('http://localhost:5169/api/RestaurantRegistration/request', {
      restaurantName: this.restName,
      email: this.restEmail,
      contact: this.restContact,
      location: this.restLocation
    }).subscribe({
      next: () => {
        alert('Your request has been submitted! Admins will review it.');
        this.loading = false;
        this.closeRestaurantModal();
      },
      error: (err) => {
        this.loading = false;
        alert('Failed to send restaurant registration request: ' + (err.error || 'Unknown error'));
      }
    });
  }
}
