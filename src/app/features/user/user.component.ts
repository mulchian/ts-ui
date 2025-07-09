import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from '../../core/services/auth.store';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  standalone: false,
})
export class UserComponent {
  loggedIn = false;

  constructor(
    protected readonly auth: AuthStore,
    private readonly route: ActivatedRoute
  ) {
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
