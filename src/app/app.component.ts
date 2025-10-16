import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../app/users/users.service';

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
  isAdmin;
  constructor(private auth: AuthService, private users: UsersService) {
    this.isLogged = this.auth.isLoggedIn;
    this.userEmail = computed(() => this.auth.user()?.email ?? '');
    this.isAdmin = this.users.isAdmin;
  }

  async logout() {
    await this.auth.logout();
  }
}
