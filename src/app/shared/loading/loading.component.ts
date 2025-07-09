import { Component, Input, OnInit } from '@angular/core';
import { LoadingService } from './loading.service';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from '@angular/router';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
  standalone: false,
})
export class LoadingComponent implements OnInit {
  @Input()
  routing = false;

  @Input()
  detectRoutingOngoing = false;

  constructor(
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.detectRoutingOngoing && !this.loadingService.isLoading()) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart || event instanceof RouteConfigLoadStart) {
          this.loadingService.loadingRoute = true;
          this.loadingService.loadingOnRouting();
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationError ||
          event instanceof NavigationCancel ||
          event instanceof RouteConfigLoadEnd
        ) {
          this.loadingService.loadingOffRouting();
          this.loadingService.loadingRoute = false;
        }
      });
    }
  }
}
