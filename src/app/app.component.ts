import { Component, computed, signal } from '@angular/core';
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
  userSig = signal<any>(null);
  isLogged = computed(() => !!this.userSig());
  userEmail = computed(() => this.userSig()?.email ?? '');

  constructor(private auth: AuthService) {
    this.auth
      .getSession()
      .then(({ data }) => this.userSig.set(data.session?.user ?? null));
  }

  async logout() {
    await this.auth.logout();
    this.userSig.set(null);
  }
}
