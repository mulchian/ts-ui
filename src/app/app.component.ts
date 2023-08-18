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
    private auth: AuthStore,
    private router: Router
  ) {}

  ngOnInit() {
    this.auth.isLoggedOut$.subscribe(isLoggedOut => {
      if (isLoggedOut) {
        this.auth
          .login('Mulchian', 'jannik0097@gmail.com', 'BHedmVUM1?')
          .subscribe(
            () => {
              console.log('Login successful!');
            },
            err => {
              console.error('Login failed!');
            }
          );
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}
