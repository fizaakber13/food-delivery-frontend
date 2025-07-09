import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './menu-items.component.html',
  styleUrls: ['./menu-items.component.css'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class MenuItemsComponent implements OnInit {
  searchText: string = '';
  menuItems: any[] = [];
  filteredMenuItems: any[] = [];

  showAddModal: boolean = false;
  showDeleteConfirm: boolean = false;

  newItem: any = {
    id: 0,
    name: '',
    rating: 0,
    category: '',
    price: 0,
    description: '',
    restaurantId: 0
  };

  editMode: boolean = false;
  deleteId: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const id = +userId;
      this.newItem.restaurantId = id;
      this.fetchMenuItems(id);
    } else {
      alert("User not logged in. Please log in again.");
    }
  }

  fetchMenuItems(restaurantId: number): void {
    this.http.get<any[]>('http://localhost:5169/api/MenuItem').subscribe({
      next: (data) => {
        this.menuItems = data.filter(item => item.restaurantId === restaurantId);
        this.applyFilter();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to fetch menu items.');
      }
    });
  }

  applyFilter(): void {
    const search = this.searchText.toLowerCase();
    this.filteredMenuItems = this.menuItems.filter(item =>
      item.name.toLowerCase().includes(search)
    );
  }

  openAddMenuModal(): void {
    this.editMode = false;
    this.newItem = {
      id: 0,
      name: '',
      rating: 0,
      category: '',
      price: 0,
      description: '',
      restaurantId: this.newItem.restaurantId
    };
    this.showAddModal = true;
  }

  editMenuItem(item: any): void {
    this.editMode = true;
    this.newItem = { ...item };
    this.showAddModal = true;
  }

  addOrUpdateMenuItem(): void {
    const url = 'http://localhost:5169/api/MenuItem';

    const request = this.editMode
      ? this.http.put(`${url}/${this.newItem.id}`, this.newItem)
      : this.http.post(url, this.newItem);

    request.subscribe({
      next: () => {
        this.fetchMenuItems(this.newItem.restaurantId);
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to save the item.');
      }
    });
  }

  confirmDeleteMenuItem(id: number): void {
    this.deleteId = id;
    this.showDeleteConfirm = true;
  }

  deleteMenuItem(): void {
    this.http.delete(`http://localhost:5169/api/MenuItem/${this.deleteId}`).subscribe({
      next: () => {
        this.fetchMenuItems(this.newItem.restaurantId);
        this.cancelDelete();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete the item.');
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteId = 0;
  }

  closeModal(): void {
    this.showAddModal = false;
  }
}
