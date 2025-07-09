import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-office',
  templateUrl: './office.component.html',
  styleUrls: ['./office.component.scss'],
  imports: [CommonModule, RouterOutlet],
})
export class OfficeComponent {
  private readonly router = inject(Router);

  showOverview(): boolean {
    return this.router.url === '/office';
  }
}
