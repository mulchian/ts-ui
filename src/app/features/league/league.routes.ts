import { Routes } from '@angular/router';
import { ResultsComponent } from './components/results/results.component';
import { StandingsComponent } from './components/standings/standings.component';

export const LEAGUE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'standings',
    pathMatch: 'full',
  },
  {
    path: 'standings',
    component: StandingsComponent,
  },
  {
    path: 'results',
    component: ResultsComponent,
  },
];
