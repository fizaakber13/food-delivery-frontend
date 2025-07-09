import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { User, Address } from '../../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  animations: [
    trigger('fadeSlideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  searchText = '';
  editMode = false;
  showModal = false;
  showDeleteConfirm = false;
  userToDelete: number | null = null;

  newUser: User = this.getEmptyUser();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  getEmptyUser(): User {
    return {
      id: 0,
      name: '',
      emailOrPhone: '',
      isAdmin: false,
      addresses: [{ line: '', isDefault: true, label: 'Home', userId: 0 }],
      cartItems: [],
      orders: []
    };
  }

  loadUsers(): void {
    this.http.get<User[]>('http://localhost:5169/api/User')
      .subscribe(data => this.users = data);
  }

  getFilteredUsers(): User[] {
    return this.users.filter(u =>
      u.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  openEditModal(user: User): void {
    this.newUser = {
      ...user,
      addresses: user.addresses.map(addr => ({ ...addr }))
    };
    this.editMode = true;
    this.showModal = true;
  }

  saveUser(): void {
    this.http.put(`http://localhost:5169/api/User/${this.newUser.id}`, this.newUser)
      .subscribe(() => {
        this.showModal = false;
        this.loadUsers();
      });
  }

  confirmDelete(id: number): void {
    this.userToDelete = id;
    this.showDeleteConfirm = true;
  }

  deleteUser(): void {
    this.http.delete(`http://localhost:5169/api/User/${this.userToDelete}`)
      .subscribe(() => {
        this.userToDelete = null;
        this.showDeleteConfirm = false;
        this.loadUsers();
      });
  }

  cancelDelete(): void {
    this.userToDelete = null;
    this.showDeleteConfirm = false;
  }

  addAddressField(): void {
    this.newUser.addresses.push({ line: '', isDefault: false, label: 'Other', userId: this.newUser.id });
  }

  removeAddressField(index: number): void {
    if (this.newUser.addresses.length > 1) {
      this.newUser.addresses.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
