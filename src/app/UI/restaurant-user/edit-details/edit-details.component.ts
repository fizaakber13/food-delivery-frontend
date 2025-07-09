import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // ✅ Import HttpClientModule

@Component({
  selector: 'app-edit-details',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // ✅ Add HttpClientModule
  templateUrl: './edit-details.component.html',
  styleUrls: ['./edit-details.component.css']
})
export class EditDetailsComponent implements OnInit {
  restaurant: any = {
  id: 0,
  name: '',
  email: '',
  contact: '',
  address: ''   
};


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const id = localStorage.getItem('userId');
    if (id) {
      this.http.get<any>(`http://localhost:5169/api/Restaurant/${id}`)
        .subscribe({
          next: (data) => {
            this.restaurant = data;
          },
          error: (err) => {
            console.error(err);
            alert('Failed to fetch restaurant details.');
          }
        });
    }
  }

  updateDetails(): void {
    this.http.put(`http://localhost:5169/api/Restaurant/${this.restaurant.id}`, this.restaurant)
      .subscribe({
        next: () => {
          alert('Details updated successfully!');
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update details.');
        }
      });
  }
}
