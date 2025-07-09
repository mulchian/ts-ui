import { Component } from '@angular/core';
import { AuthStore } from '../../core/services/auth.store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
})
export class HomeComponent {
  constructor(protected readonly auth: AuthStore) {}
}
