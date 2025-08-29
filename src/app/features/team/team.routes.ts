import { Routes } from '@angular/router';
import { RosterComponent } from './components/roster/roster.component';
import { LineupComponent } from './components/lineup/lineup.component';
import { CoachingComponent } from './components/coaching/coaching.component';
import { TrainingComponent } from './components/training/training.component';
import { CreateComponent } from './components/create/create.component';

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
  {
    path: 'training',
    component: TrainingComponent,
  },
  {
    path: 'create',
    component: CreateComponent,
  },
];
