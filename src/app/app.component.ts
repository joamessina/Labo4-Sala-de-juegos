import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLogged;
  userEmail;

  constructor(private auth: AuthService) {
    this.isLogged = this.auth.isLoggedIn;
    this.userEmail = computed(() => this.auth.user()?.email ?? '');
  }

  async logout() {
    await this.auth.logout();
  }
}
