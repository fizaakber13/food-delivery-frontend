import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  address: string;
  contact: string;
  email: string; 
}

@Component({
  selector: 'app-restaurant-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './restaurant-management.component.html',
  styleUrls: ['./restaurant-management.component.css'],
  animations: [
    trigger('fadeSlideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class RestaurantManagementComponent implements OnInit {
  restaurants: Restaurant[] = [];
  searchText = '';
  showAddModal = false;
  editMode = false;
  showDeleteConfirm = false;
  restaurantToDeleteId: number | null = null;

  newRestaurant: Restaurant = {
    id: 0,
    name: '',
    cuisine: '',
    rating: 0,
    address: '',
    contact: '',
    email: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  fetchRestaurants(): void {
    this.http.get<Restaurant[]>('http://localhost:5169/api/Restaurant')
      .subscribe(data => this.restaurants = data);
  }

  filteredRestaurants(): Restaurant[] {
    return this.restaurants.filter(r =>
      r.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  addOrUpdateRestaurant(): void {
    const url = this.editMode
      ? `http://localhost:5169/api/Restaurant/${this.newRestaurant.id}`
      : 'http://localhost:5169/api/Restaurant';

    const req = this.editMode
      ? this.http.put(url, this.newRestaurant)
      : this.http.post(url, this.newRestaurant);

    req.subscribe(() => {
      this.fetchRestaurants();
      this.closeModal();
    });
  }

  editRestaurant(restaurant: Restaurant): void {
    this.newRestaurant = { ...restaurant };
    this.editMode = true;
    this.showAddModal = true;
  }

  confirmDeleteRestaurant(id: number): void {
    this.restaurantToDeleteId = id;
    this.showDeleteConfirm = true;
  }

  deleteRestaurant(): void {
    if (this.restaurantToDeleteId !== null) {
      this.http.delete(`http://localhost:5169/api/Restaurant/${this.restaurantToDeleteId}`)
        .subscribe(() => {
          this.fetchRestaurants();
          this.cancelDelete();
        });
    }
  }

  cancelDelete(): void {
    this.restaurantToDeleteId = null;
    this.showDeleteConfirm = false;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editMode = false;
    this.newRestaurant = {
      id: 0,
      name: '',
      cuisine: '',
      rating: 0,
      address: '',
      contact: '',
      email: '' 
    };
  }
}
