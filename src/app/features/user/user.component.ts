import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthStore } from '../../core/services/auth.store';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  imports: [CommonModule, MatCardModule, RouterModule, MatButton],
})
export class UserComponent {
  protected readonly auth = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);

  loggedIn = false;

  constructor() {
    this.auth.isLoggedIn$.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  showProfile(): boolean {
    return this.route.snapshot.firstChild?.routeConfig?.path === 'profile';
  }

  isLoginPath(): boolean {
    return this.route.snapshot.firstChild?.routeConfig?.path === 'login';
  }
}
