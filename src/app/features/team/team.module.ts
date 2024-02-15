import { NgModule } from '@angular/core';
import { RosterComponent } from './roster/roster.component';
import { TeamRoutingModule } from './team-routing.module';

@NgModule({
  declarations: [RosterComponent],
  imports: [TeamRoutingModule],
  exports: [],
  providers: [],
})
export class TeamModule {}
