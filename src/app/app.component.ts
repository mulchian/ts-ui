import { Component } from '@angular/core';
import { AuthStore } from './services/auth.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    protected readonly auth: AuthStore,
    private readonly router: Router
  ) {}

  logout() {
    this.auth.logout();
  }
}
