import { Routes } from '@angular/router';
import { RosterComponent } from './components/roster/roster.component';
import { LineupComponent } from './components/lineup/lineup.component';
import { CoachingComponent } from './components/coaching/coaching.component';

export const TEAM_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'roster',
    pathMatch: 'full',
  },
  {
    path: 'roster',
    component: RosterComponent,
  },
  {
    path: 'contracts',
    component: RosterComponent,
  },
  {
    path: 'lineup',
    component: LineupComponent,
  },
  {
    path: 'coaching',
    component: CoachingComponent,
  },
];
