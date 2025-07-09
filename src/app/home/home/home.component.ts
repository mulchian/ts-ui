import { Component, inject } from '@angular/core';
import { AuthStore } from '../../core/services/auth.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class HomeComponent {
  protected readonly auth = inject(AuthStore);
}
