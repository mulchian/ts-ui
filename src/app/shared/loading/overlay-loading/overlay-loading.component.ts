import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-overlay-loading',
  templateUrl: './overlay-loading.component.html',
  styleUrls: ['./overlay-loading.component.scss'],
  imports: [CommonModule, MatProgressSpinner],
})
export class OverlayLoadingComponent {
  constructor() {}
}
