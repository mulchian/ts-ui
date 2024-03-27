import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RosterComponent } from './roster/roster.component';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class TeamRoutingModule {}
