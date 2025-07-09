import { Component, inject } from '@angular/core';
import { AuthStore } from './core/services/auth.store';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private readonly auth = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);

  loggedIn = false;

  constructor() {
    this.auth.isLoggedIn$.subscribe((loggedIn: boolean) => (this.loggedIn = loggedIn));
  }

  logout() {
    this.auth.logout();
  }

  isSpecialPath(path: string): boolean {
    return this.route.snapshot.firstChild?.routeConfig?.path === path;
  }
}
