import { Component } from '@angular/core';
import { Team } from '../../../../core/model/team';
import { CoachingName } from '../../../../core/model/coachingName';
import { TeamService } from '../../../../core/services/team.service';
import { CoachingService } from '../../services/coaching.service';
import { Coaching } from '../../../../core/model/coaching';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSliderDragEvent } from '@angular/material/slider';

@Component({
  selector: 'app-coaching',
  templateUrl: './coaching.component.html',
  styleUrls: ['./coaching.component.scss'],
})
export class CoachingComponent {
  team: Team | undefined;
  teamPart: 'general' | 'offense' | 'defense' = 'offense';

  runGameplays = ['Inside Run', 'Outside Run rechts', 'Outside Run links'];
  passGameplays = ['Screen Pass', 'Short Pass', 'Medium Pass', 'Long Pass'];

  runDefGameplays = ['Box', 'Outside Contain', 'Inside Blitz', 'Outside Blitz', 'Auf Reaktion'];
  passDefGameplays = ['Coverage', 'Blitz', 'Coverage Tief', 'Auf Reaktion'];

  offCoachingNames: CoachingName[] = [];
  selectedOffCoaching = 1;

  defCoachingNames: CoachingName[] = [];
  selectedDefCoaching = 1;

  generalCoachings: Coaching[] = [];
  offCoachings: Coaching[] = [];
  defCoachings: Coaching[] = [];

  constructor(
    private readonly teamService: TeamService,
    private readonly coachingService: CoachingService
  ) {
    this.teamService.team$.subscribe(team => {
      if (team) {
        this.team = team;
        this.generalCoachings = team.coachings.filter(coaching => coaching.teamPart === 'general');
        this.offCoachings = team.coachings.filter(coaching => coaching.teamPart === 'offense');
        this.defCoachings = team.coachings.filter(coaching => coaching.teamPart === 'defense');
        if (team.coachingNames) {
          this.offCoachingNames = team.coachingNames.filter(coachingName => coachingName.teamPart === 'offense');
          this.defCoachingNames = team.coachingNames.filter(coachingName => coachingName.teamPart === 'defense');
        } else {
          for (let i = 1; i <= 5; i++) {
            this.offCoachingNames.push({
              gameplanNr: i,
              id: 0,
              teamId: team.id,
              name: 'Gameplan ' + i,
              teamPart: 'offense',
            });
            this.defCoachingNames.push({
              gameplanNr: i,
              id: 0,
              teamId: team.id,
              name: 'Gameplan ' + i,
              teamPart: 'defense',
            });
          }
        }
        this.selectedOffCoaching = team.gameplanOff;
        this.selectedDefCoaching = team.gameplanDef;
      }
    });
  }

  formatPercentLabel(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'percent' }).format(value / 100);
  }

  changeGameplayType(event: MatSlideToggleChange, coaching: Coaching, gameplayNr: number) {
    let gameplayType = 'Run';
    let defaultGameplay = this.runGameplays[0];
    if (event.checked) {
      gameplayType = 'Pass';
      defaultGameplay = this.passGameplays[0];
    }
    switch (gameplayNr) {
      case 1:
        coaching.gameplay1 = gameplayType + ';' + defaultGameplay;
        break;
      case 2:
        coaching.gameplay2 = gameplayType + ';' + defaultGameplay;
        break;
    }
    this.saveCoaching(coaching);
  }

  changeCoachingRate(event: MatSliderDragEvent, changedCoaching: Coaching) {
    this.saveCoaching(changedCoaching);
  }

  changeCoachingGameplay(coaching: Coaching) {
    this.saveCoaching(coaching);
  }

  private saveCoaching(coaching: Coaching) {
    console.log(coaching);
    this.coachingService.saveCoaching(coaching).subscribe(res => {
      if (res.coachingSaved) {
        console.log('coachingSaved: ' + res.coachingSaved);
        // this.teamService.updateTeam();
      }
    });
  }
}
