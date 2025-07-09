import { NgModule } from '@angular/core';
import { RosterComponent } from './components/roster/roster.component';
import { TeamRoutingModule } from './team-routing.module';
import { MatTableModule } from '@angular/material/table';
import { CurrencyPipe, NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase, PercentPipe } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TalentPipe } from '../../shared/pipe/talent.pipe';
import { SaisonCountPipe } from '../../shared/pipe/saison-count.pipe';
import { MatButtonModule } from '@angular/material/button';
import { TippyDirective } from '@ngneat/helipopper';
import { SharedModule } from '../../shared/shared.module';
import { MatSortModule } from '@angular/material/sort';
import { LineupComponent } from './components/lineup/lineup.component';
import { LineupTeamPartComponent } from './components/lineup/lineup-team-part/lineup-team-part.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { LineupService } from './services/lineup.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SkillService } from './services/skill.service';
import { PlayerCardModalComponent } from '../../shared/modal/player-card-modal/player-card-modal.component';
import { PositionService } from './services/position.service';
import { CoachingComponent } from './components/coaching/coaching.component';
import { MatSelectModule } from '@angular/material/select';
import { CoachingService } from './services/coaching.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [RosterComponent, LineupComponent, LineupTeamPartComponent, CoachingComponent],
  imports: [
    TeamRoutingModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
    NgIf,
    PercentPipe,
    TalentPipe,
    CurrencyPipe,
    SaisonCountPipe,
    TippyDirective,
    SharedModule,
    NgSwitch,
    NgSwitchCase,
    MatGridListModule,
    MatCardModule,
    NgForOf,
    MatSlideToggleModule,
    MatInputModule,
    NgClass,
    MatButtonToggleModule,
    FormsModule,
    DragDropModule,
    PlayerCardModalComponent,
    MatSelectModule,
    MatSliderModule,
    MatIconModule,
  ],
  exports: [],
  providers: [SkillService, LineupService, PositionService, CoachingService],
})
export class TeamModule {}
