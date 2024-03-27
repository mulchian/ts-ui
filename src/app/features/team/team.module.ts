import { NgModule } from '@angular/core';
import { RosterComponent } from './roster/roster.component';
import { TeamRoutingModule } from './team-routing.module';
import { MatTableModule } from '@angular/material/table';
import { CurrencyPipe, NgIf, PercentPipe } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TalentPipe } from '../../shared/pipe/talent.pipe';
import { SaisonCountPipe } from '../../shared/pipe/saison-count.pipe';
import { MatButtonModule } from '@angular/material/button';
import { TippyDirective } from '@ngneat/helipopper';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [RosterComponent],
  imports: [
    TeamRoutingModule,
    MatTableModule,
    NgIf,
    MatProgressBarModule,
    PercentPipe,
    TalentPipe,
    CurrencyPipe,
    SaisonCountPipe,
    MatButtonModule,
    TippyDirective,
    SharedModule,
  ],
  exports: [],
  providers: [],
})
export class TeamModule {}
