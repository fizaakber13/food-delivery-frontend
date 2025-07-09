import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  address: string;
}


@Component({
  selector: 'app-restaurant-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], 
  templateUrl: './restaurant-listing.component.html',
  styleUrls: ['./restaurant-listing.component.css'],
  animations: [
    trigger('fadeSlideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class RestaurantListingComponent implements OnInit {
  restaurants: Restaurant[] = [];
  filtered: Restaurant[] = [];

  cuisineTypes: string[] = [];

  searchText = '';
  selectedCuisine = '';
  minRating = 0;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchRestaurants();
    this.fetchCuisines();
  }

  fetchRestaurants(): void {
    this.http.get<Restaurant[]>('http://localhost:5169/api/Restaurant').subscribe({
      next: (res) => {
        this.restaurants = res;
        this.applyFilters();
      },
      error: () => alert('Failed to load restaurants')
    });
  }

  fetchCuisines(): void {
    this.http.get<string[]>('http://localhost:5169/api/Restaurant/cuisines').subscribe({
      next: (res) => {
        this.cuisineTypes = res.map(c => c.toLowerCase()); 
      },
      error: () => alert('Failed to load cuisines')
    });
  }

  applyFilters(): void {
    this.filtered = this.restaurants.filter(r =>
      r.name.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.selectedCuisine === '' || r.cuisine.toLowerCase() === this.selectedCuisine.toLowerCase()) &&
      (!this.minRating || r.rating >= this.minRating)
    );
  }

  viewMenu(id: number): void {
    this.router.navigate(['/customer/menu', id]);
  }
}
