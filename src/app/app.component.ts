import { Component } from '@angular/core';
import { AuthStore } from './services/auth.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(protected readonly auth: AuthStore) {}

  logout() {
    this.auth.logout();
  }
}
