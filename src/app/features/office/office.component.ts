import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-office',
  templateUrl: './office.component.html',
  styleUrls: ['./office.component.scss'],
})
export class OfficeComponent {
  constructor(private readonly router: Router) {}

  showOverview(): boolean {
    console.log('url', this.router.url);
    return this.router.url === '/office';
  }
}
