import { Component } from '@angular/core';
import { AuthStore } from './services/auth.store';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  loggedIn = false;

  constructor(
    private readonly auth: AuthStore,
    private readonly route: ActivatedRoute
  ) {
    this.auth.isLoggedIn$.subscribe(
      (loggedIn: boolean) => (this.loggedIn = loggedIn)
    );
  }

  logout() {
    this.auth.logout();
  }

  isOffice(): boolean {
    return this.route.snapshot.firstChild?.routeConfig?.path === 'office';
  }
}
