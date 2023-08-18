import { Component, OnInit } from '@angular/core';
import { AuthStore } from './services/auth.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    protected readonly auth: AuthStore,
    private readonly router: Router
  ) {}

  ngOnInit() {}

  logout() {
    this.auth.logout();
  }
}
