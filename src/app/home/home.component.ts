import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  username: string | null = null;
  ProfileName: string = '';
  today: Date = new Date();

  constructor(
    private auth: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.username = this.auth.getUsername();
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const url = 'https://smc.cusmc.org/api/ECampusAPI/getUserDetail2';

    this.http.get<any>(url).subscribe({
      next: (res) => {
        const user = Array.isArray(res) ? res[0] : res;

        this.ProfileName = user?.ProfileName || this.username || '';

        console.log('API Response:', user);
        console.log('Profile Name:', this.ProfileName);
      },
      error: (err) => {
        console.error('API Error:', err);
        this.ProfileName = this.username || '';
      },
    });
  }
}