import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  userSig = signal<any>(null);
  userEmail = computed(() => this.userSig()?.email ?? '');
  isLogged = computed(() => !!this.userSig());

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
