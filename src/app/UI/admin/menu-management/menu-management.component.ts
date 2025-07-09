import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  address: string;
  rating: number;
}

interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  rating: number;         
  category: string;
  price: number;
  description: string;
}

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './menu-management.component.html',
  styleUrls: ['./menu-management.component.css'],
  animations: [
    trigger('fadeSlideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MenuManagementComponent implements OnInit {
  restaurants: Restaurant[] = [];
  allMenuItems: MenuItem[] = [];
  searchText: string = '';
  expandedRestaurantId: number | null = null;

  showAddModal: boolean = false;
  editMode: boolean = false;
  selectedRestaurantId: number | null = null;

  newItem: MenuItem = {
    id: 0,
    restaurantId: 0,
    name: '',
    rating: 0,        
    category: '',
    price: 0,
    description: ''
  };

  showDeleteConfirm = false;
  menuItemToDeleteId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRestaurants();
    this.loadMenuItems();
  }

  loadRestaurants(): void {
    this.http.get<Restaurant[]>('http://localhost:5169/api/Restaurant')
      .subscribe(data => this.restaurants = data);
  }

  loadMenuItems(): void {
    this.http.get<MenuItem[]>('http://localhost:5169/api/MenuItem')
      .subscribe(data => this.allMenuItems = data);
  }

  getFilteredRestaurants(): Restaurant[] {
    const search = this.searchText.toLowerCase();
    return this.restaurants.filter(restaurant => {
      const matchesRestaurant = restaurant.name.toLowerCase().includes(search);
      const hasMatchingMenuItem = this.allMenuItems.some(item =>
        item.restaurantId === restaurant.id &&
        item.name.toLowerCase().includes(search)
      );
      return matchesRestaurant || hasMatchingMenuItem;
    });
  }

  getMenuItemsForRestaurant(restaurantId: number): MenuItem[] {
    return this.allMenuItems.filter(item =>
      item.restaurantId === restaurantId &&
      item.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  toggleExpand(id: number): void {
    this.expandedRestaurantId = this.expandedRestaurantId === id ? null : id;
  }

  openAddMenuModal(restaurantId: number): void {
    this.newItem = {
      id: 0,
      restaurantId,
      name: '',
      rating: 0,        
      category: '',
      price: 0,
      description: ''
    };
    this.selectedRestaurantId = restaurantId;
    this.editMode = false;
    this.showAddModal = true;
  }

  editMenuItem(item: MenuItem): void {
    this.newItem = { ...item };
    this.selectedRestaurantId = item.restaurantId;
    this.editMode = true;
    this.showAddModal = true;
  }

  addOrUpdateMenuItem(): void {
    this.newItem.restaurantId = this.selectedRestaurantId!;
    if (this.editMode) {
      this.http.put(`http://localhost:5169/api/MenuItem/${this.newItem.id}`, this.newItem)
        .subscribe(() => {
          this.loadMenuItems();
          this.closeModal();
        });
    } else {
      this.http.post<MenuItem>('http://localhost:5169/api/MenuItem', this.newItem)
        .subscribe(() => {
          this.loadMenuItems();
          this.closeModal();
        });
    }
  }

  confirmDeleteMenuItem(id: number): void {
    this.menuItemToDeleteId = id;
    this.showDeleteConfirm = true;
  }

  deleteMenuItem(): void {
    if (this.menuItemToDeleteId !== null) {
      this.http.delete(`http://localhost:5169/api/MenuItem/${this.menuItemToDeleteId}`)
        .subscribe(() => {
          this.loadMenuItems();
          this.cancelDelete();
        });
    }
  }

  cancelDelete(): void {
    this.menuItemToDeleteId = null;
    this.showDeleteConfirm = false;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editMode = false;
    this.selectedRestaurantId = null;
    this.newItem = {
      id: 0,
      restaurantId: 0,
      name: '',
      rating: 0,         
      category: '',
      price: 0,
      description: ''
    };
  }
}
