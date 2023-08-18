import { NgModule } from '@angular/core';
import { RosterComponent } from './roster/roster.component';
import { TeamRoutingModule } from './team-routing.module';
import { TeamService } from './services/team.service';

@NgModule({
  declarations: [RosterComponent],
  imports: [TeamRoutingModule],
  exports: [],
  providers: [TeamService],
})
export class TeamModule {}
