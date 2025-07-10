import { Component, inject } from '@angular/core';
import { AuthStore } from './core/services/auth.store';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TeamService } from './core/services/team.service';
import { StadiumService } from './core/services/stadium.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from './shared/loading/loading.component';
import { TeamChipSetComponent } from './shared/team-chip-set/team-chip-set.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    MatTooltipModule,
    MatChipsModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingComponent,
    TeamChipSetComponent,
    NgOptimizedImage,
  ],
  providers: [TeamService, StadiumService],
})
export class AppComponent {
  loggedIn = false;
  private readonly auth = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.auth.isLoggedIn$.subscribe((loggedIn: boolean) => (this.loggedIn = loggedIn));
  }

  logout() {
    this.auth.logout();
  }

  isSpecialPath(path: string): boolean {
    return this.route.snapshot.firstChild?.routeConfig?.path === path;
  }
}
