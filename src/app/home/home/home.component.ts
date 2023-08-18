import { Component } from '@angular/core';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(protected readonly auth: AuthStore) {}
}
