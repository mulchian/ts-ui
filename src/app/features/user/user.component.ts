import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  constructor(
    protected readonly auth: AuthStore,
    private readonly route: ActivatedRoute
  ) {}

  showProfile() {
    return this.route.snapshot.firstChild?.routeConfig?.path === 'profile';
  }

  isLoginPath() {
    return this.route.snapshot.firstChild?.routeConfig?.path === 'login';
  }
}
