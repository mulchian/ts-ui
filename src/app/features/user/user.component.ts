import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
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
