import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RosterComponent } from './components/roster/roster.component';
import { LineupComponent } from './components/lineup/lineup.component';
import { CoachingComponent } from './components/coaching/coaching.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class TeamRoutingModule {}
