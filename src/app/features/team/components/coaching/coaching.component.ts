import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { Team } from '../../../../core/model/team';
import { CoachingName } from '../../../../core/model/coachingName';
import { TeamService } from '../../../../core/services/team.service';
import { CoachingService } from '../../services/coaching.service';
import { Coaching } from '../../../../core/model/coaching';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSliderDragEvent, MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TippyDirective } from '@ngneat/helipopper';
import { TippyInstance } from '@ngneat/helipopper/config';
import { InputModalComponent } from '../../../../shared/modal/tooltip/input-modal/input-modal.component';
import { LoadingService } from '../../../../shared/loading/loading.service';
import { BehaviorSubject, debounceTime, Observable, Subject, take, takeUntil } from 'rxjs';
import { SessionStorageService } from '../../../../core/services/session-storage.service';

@Component({
  selector: 'app-coaching',
  templateUrl: './coaching.component.html',
  styleUrls: ['./coaching.component.scss'],
  imports: [
    CommonModule,
    MatButtonToggleModule,
    FormsModule,
    MatFormField,
    MatLabel,
    MatSelectModule,
    MatIcon,
    MatIconButton,
    MatSliderModule,
    MatCardModule,
    MatSlideToggle,
    TippyDirective,
    InputModalComponent,
  ],
  providers: [TeamService, CoachingService],
})
export class CoachingComponent implements OnDestroy {
  team: Team | undefined;
  teamPart: 'general' | 'offense' | 'defense';
  runGameplays = ['Inside Run', 'Outside Run rechts', 'Outside Run links'];
  passGameplays = ['Screen Pass', 'Short Pass', 'Medium Pass', 'Long Pass'];
  runDefGameplays = ['Box', 'Outside Contain', 'Inside Blitz', 'Outside Blitz', 'Auf Reaktion'];
  passDefGameplays = ['Coverage', 'Blitz', 'Coverage Tief', 'Auf Reaktion'];
  generalCoachingNames: CoachingName[] = [];
  selectedGeneralCoaching = 1;
  offCoachingNames: CoachingName[] = [];
  selectedOffCoaching = 1;
  defCoachingNames: CoachingName[] = [];
  selectedDefCoaching = 1;
  generalCoachings: Record<number, Coaching[]> = { 1: [] };
  offCoachings: Record<number, Coaching[]> = { 1: [] };
  defCoachings: Record<number, Coaching[]> = { 1: [] };
  @ViewChild('tpChangeName')
  tpChangeName: TippyInstance | undefined;
  protected subject = new BehaviorSubject<string>('30');
  fieldGoalRange$: Observable<string> = this.subject.asObservable();
  unsubscribe$ = new Subject<void>();
  private readonly teamService = inject(TeamService);
  private readonly coachingService = inject(CoachingService);
  private readonly loadingService = inject(LoadingService);
  private readonly sessionStorageService = inject(SessionStorageService);

  constructor() {
    this.teamService.team$.pipe(takeUntil(this.unsubscribe$)).subscribe(team => {
      if (team) {
        this.team = team;
        this.loadCoachings();

        if (this.generalCoachings[this.selectedGeneralCoaching]) {
          const firstDownCoaching = this.generalCoachings[this.selectedGeneralCoaching].find(
            coaching => coaching.down === '1st'
          );
          if (firstDownCoaching) {
            const fieldGoalRange = firstDownCoaching.gameplay1.split(';')[1]; // Get the gameplay1 part after the semicolon
            if (fieldGoalRange && this.subject.getValue() !== fieldGoalRange) {
              this.subject.next(fieldGoalRange); // Default to 30 yards if not set
            }
          }
        }
      }
    });

    this.teamPart = this.sessionStorageService.getSelectedCoachingTeamPart();

    this.fieldGoalRange$.pipe(debounceTime(1000), takeUntil(this.unsubscribe$)).subscribe(newRange => {
      console.log('Field goal range changed:', newRange);
      const selectedGeneralCoaching = this.generalCoachings[this.selectedGeneralCoaching].filter(
        coaching => coaching.down === '1st' && coaching.gameplay1.startsWith('FGRange')
      )[0];
      if (selectedGeneralCoaching?.gameplay1.split(';')[1] != newRange) {
        this.coachingService
          .changeFieldGoalRange(selectedGeneralCoaching, newRange)
          .pipe(take(1))
          .subscribe(res => {
            if (res.fieldGoalRangeUpdated) {
              console.log('Field goal range updated successfully');
            } else {
              console.error('Error updating field goal range:', res.error);
            }
          });
      } else {
        console.log('Field goal range not changed, no update needed');
      }
    });
  }

  ngOnDestroy(): void {
    console.log('CoachingComponent destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateTeamPart() {
    this.sessionStorageService.setSelectedCoachingTeamPart(this.teamPart);
  }

  loadCoachings() {
    this.loadingService.loadingOn();
    if (this.team) {
      const team = this.team;
      this.generalCoachings = this.filterCoaching(team.coachings, 'general');
      this.offCoachings = this.filterCoaching(team.coachings, 'offense');
      this.defCoachings = this.filterCoaching(team.coachings, 'defense');

      this.generalCoachingNames = this.getCoachingNames(team, 'general', this.generalCoachings);
      this.offCoachingNames = this.getCoachingNames(team, 'offense', this.offCoachings);
      this.defCoachingNames = this.getCoachingNames(team, 'defense', this.defCoachings);

      this.selectedGeneralCoaching = team.gameplanGeneral;
      this.selectedOffCoaching = team.gameplanOff;
      this.selectedDefCoaching = team.gameplanDef;
    }
    this.loadingService.loadingOff();
  }

  formatPercentLabel(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'percent' }).format(value / 100);
  }

  formatYardsLabel(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'unit', unit: 'yard', unitDisplay: 'long' }).format(value);
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

  addGameplan(teamPart: 'general' | 'offense' | 'defense') {
    this.loadingService.loadingOn();
    let usedGameplanNrs: string[] = [];
    switch (teamPart) {
      case 'general':
        usedGameplanNrs = Object.keys(this.generalCoachings);
        break;
      case 'offense':
        usedGameplanNrs = Object.keys(this.offCoachings);
        break;
      case 'defense':
        usedGameplanNrs = Object.keys(this.defCoachings);
        break;
    }

    // find the first unused gameplan number
    let newGameplanNr = 1;
    for (let i = 1; i <= 5; i++) {
      if (!usedGameplanNrs.includes(i.toString())) {
        newGameplanNr = i;
        break;
      }
    }

    this.coachingService
      .createNewGameplan(teamPart, newGameplanNr)
      .pipe(take(1))
      .subscribe(res => {
        if (res.gameplanCreated) {
          console.log('New gameplan created: ' + res.gameplanCreated);
          this.teamService.updateTeam();
          switch (teamPart) {
            case 'offense':
              this.selectedOffCoaching = newGameplanNr;
              break;
            case 'defense':
              this.selectedDefCoaching = newGameplanNr;
              break;
          }
          this.loadingService.loadingOff();
        } else if (res.error) {
          console.error('Error creating new gameplan: ' + res.error);
          // Handle error, e.g., show a notification to the user
        }
      });
  }

  renameDefCoaching(newName: string) {
    const coachingName = this.defCoachingNames.find(name => name.gameplanNr === this.selectedDefCoaching);
    if (coachingName) {
      this.renameCoaching(coachingName, newName);
    }
  }

  renameOffCoaching(newName: string) {
    const coachingName = this.offCoachingNames.find(name => name.gameplanNr === this.selectedOffCoaching);
    if (coachingName) {
      this.renameCoaching(coachingName, newName);
    }
  }

  renameGeneralCoaching(newName: string) {
    const coachingName = this.generalCoachingNames.find(name => name.gameplanNr === this.selectedOffCoaching);
    if (coachingName) {
      this.renameCoaching(coachingName, newName);
    }
  }

  onCoachingChange(event: MatSelectChange, teamPart: 'general' | 'offense' | 'defense') {
    switch (teamPart) {
      case 'offense':
        this.selectedOffCoaching = event.value;
        break;
      case 'defense':
        this.selectedDefCoaching = event.value;
        break;
      case 'general':
        this.selectedGeneralCoaching = event.value;
        break;
    }

    this.coachingService
      .updateActiveGameplan(teamPart, event.value)
      .pipe(take(1))
      .subscribe(res => {
        if (res.gameplanUpdated) {
          console.log('Offensive gameplan updated: ' + res.gameplanUpdated);
          this.teamService.updateTeam();
        }
      });
  }

  removeSelectedGameplan(teamPart: 'offense' | 'defense' | 'general') {
    this.loadingService.loadingOn();
    // test if there are more than one gameplanNr for the selected teamPart
    let gameplanNr = null;
    switch (teamPart) {
      case 'offense':
        if (Object.keys(this.offCoachings).length > 1) {
          gameplanNr = this.selectedOffCoaching;
        }
        break;
      case 'defense':
        if (Object.keys(this.defCoachings).length > 1) {
          gameplanNr = this.selectedDefCoaching;
        }
        break;
      case 'general':
        if (Object.keys(this.generalCoachings).length > 1) {
          gameplanNr = this.selectedGeneralCoaching;
        }
        break;
    }
    if (!gameplanNr) {
      console.error('Cannot remove gameplan: Only one gameplan left for ' + teamPart);
      this.loadingService.loadingOff();
      return;
    }

    this.coachingService
      .removeGameplan(teamPart, gameplanNr)
      .pipe(take(1))
      .subscribe(res => {
        if (res.gameplanRemoved) {
          console.log('Gameplan removed: ' + res.gameplanRemoved);
          this.teamService.updateTeam();
          switch (teamPart) {
            case 'offense':
              this.selectedOffCoaching = 1;
              break;
            case 'defense':
              this.selectedDefCoaching = 1;
              break;
          }
        } else if (res.error) {
          console.error('Error removing gameplan: ' + res.error);
        }
        this.loadingService.loadingOff();
      });
  }

  getSelectedCoachingName(teamPart: 'general' | 'offense' | 'defense'): string {
    switch (teamPart) {
      case 'general':
        return (
          this.generalCoachingNames.find(c => c.gameplanNr === this.selectedGeneralCoaching)?.name ||
          'Gameplan ' + this.selectedGeneralCoaching
        );
      case 'offense':
        return (
          this.offCoachingNames.find(c => c.gameplanNr === this.selectedOffCoaching)?.name ||
          'Gameplan ' + this.selectedOffCoaching
        );
      case 'defense':
        return (
          this.defCoachingNames.find(c => c.gameplanNr === this.selectedDefCoaching)?.name ||
          'Gameplan ' + this.selectedDefCoaching
        );
    }
  }

  filterGeneralCoaching(generalCoachingPart: '2PtCon' | '4thDown' | 'QBRun') {
    const generalCoaching = this.generalCoachings[this.selectedGeneralCoaching].filter(
      coaching =>
        coaching.gameplay1.startsWith(generalCoachingPart) || coaching.gameplay2.startsWith(generalCoachingPart)
    )[0];

    switch (generalCoachingPart) {
      case '2PtCon':
        return generalCoaching.gameplay2.split(';')[1] || '0';
      case '4thDown':
        return generalCoaching.gameplay1.split(';')[1] || 'Nie';
      case 'QBRun':
        return generalCoaching.gameplay2.split(';')[1] || '0';
    }
  }

  changeTwoPtConversion(event: MatSelectChange) {
    // get general coaching for the selected gameplan and change the 2PtCon value
    this.changeGeneralCoaching('2PtCon', '1st', event.value);
  }

  changeFourthDown($event: MatSelectChange) {
    // get general coaching for the selected gameplan and change the 4thDown value
    this.changeGeneralCoaching('4thDown', '2nd', $event.value);
  }

  changeQbRun($event: MatSelectChange) {
    // get general coaching for the selected gameplan and change the QBRun value
    this.changeGeneralCoaching('QBRun', '2nd', $event.value);
  }

  private changeGeneralCoaching(
    generalCoachingPart: '2PtCon' | '4thDown' | 'QBRun',
    down: '1st' | '2nd',
    newValue: string
  ) {
    // get general coaching for the selected gameplan and change the value for the given part
    const selectedCoaching = this.generalCoachings[this.selectedGeneralCoaching].filter(
      coaching =>
        coaching.down === down &&
        (coaching.gameplay1.startsWith(generalCoachingPart) || coaching.gameplay2.startsWith(generalCoachingPart))
    )[0];

    if (selectedCoaching) {
      const gameplayParts =
        generalCoachingPart === '4thDown'
          ? selectedCoaching.gameplay1.split(';')
          : selectedCoaching.gameplay2.split(';');
      switch (generalCoachingPart) {
        case '2PtCon':
          gameplayParts[1] = newValue; // Update the 2PtCon value
          selectedCoaching.gameplay2 = gameplayParts.join(';');
          break;
        case '4thDown':
          gameplayParts[1] = newValue; // Update the 4thDown value
          selectedCoaching.gameplay1 = gameplayParts.join(';');
          break;
        case 'QBRun':
          gameplayParts[1] = newValue; // Update the QBRun value
          selectedCoaching.gameplay2 = gameplayParts.join(';');
          break;
      }
      this.saveCoaching(selectedCoaching);
    }
  }

  private getCoachingNames(
    team: Team,
    teamPart: 'offense' | 'defense' | 'general',
    coachings: Record<number, Coaching[]>
  ): CoachingName[] {
    let coachingNames: CoachingName[] = [];
    // can be just one off coaching name and no names for defense or general
    if (team.coachingNames && team.coachingNames.length > 0) {
      coachingNames = team.coachingNames.filter(coachingName => coachingName.teamPart === teamPart);
    }

    // if this teamPart has no coaching names, we create default names
    if (coachingNames.length < Object.keys(coachings).length) {
      // the coaching name is just 'Gameplan 1', 'Gameplan 2', etc.
      // only show the gameplan numbers if there are coachings in the coaching record
      // e.g., coachings[1] -> 'Gameplan 1', coachings[2] -> 'Gameplan 2', etc.
      let gameplanNrs = Object.keys(coachings).map(Number);
      // filter out the gameplan numbers that already have a coaching name
      gameplanNrs = gameplanNrs.filter(
        gameplanNr => !coachingNames.some(coachingName => coachingName.gameplanNr === gameplanNr)
      );
      const createdCoachingNames = gameplanNrs.map(gameplanNr => ({
        id: 0, // id is not used but required for the interface
        idTeam: team.id,
        gameplanNr: gameplanNr,
        name: 'Gameplan ' + gameplanNr,
        teamPart: teamPart,
      }));
      coachingNames = [...coachingNames, ...createdCoachingNames];
    }

    return coachingNames;
  }

  private filterCoaching(
    coachings: Coaching[],
    teamPart: 'offense' | 'defense' | 'general'
  ): Record<number, Coaching[]> {
    const gameplanNrs = coachings
      .filter(coaching => coaching.teamPart === teamPart)
      .map(coaching => coaching.gameplanNr);
    let filteredCoachings: Record<number, Coaching[]> = {};
    for (let gameplanNr of gameplanNrs) {
      filteredCoachings[gameplanNr] = coachings.filter(
        coaching => coaching.teamPart === teamPart && coaching.gameplanNr === gameplanNr
      );
    }
    return filteredCoachings;
  }

  private saveCoaching(coaching: Coaching) {
    console.log(coaching);
    this.coachingService
      .saveCoaching(coaching)
      .pipe(take(1))
      .subscribe(res => {
        if (res.coachingSaved) {
          console.log('coachingSaved: ' + res.coachingSaved);
          this.teamService.updateTeam();
        }
      });
  }

  private renameCoaching(coachingName: CoachingName, newName: string) {
    const oldName = coachingName.name;
    coachingName.name = newName;
    this.coachingService
      .saveCoachingName(coachingName)
      .pipe(take(1))
      .subscribe(res => {
        if (res.coachingNameSaved) {
          console.log('New coaching name saved: ' + res.coachingNameSaved);
          this.teamService.updateTeam();
          this.tpChangeName?.hide();
        } else {
          console.error('Error saving coaching name: ' + res.coachingNameSaved);
          coachingName.name = oldName; // revert to old name if saving failed
          this.tpChangeName?.hide();
        }
      });
  }
}
