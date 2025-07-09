import { Component, OnInit, ViewChild } from '@angular/core';
import { TeamService } from '../../../../core/services/team.service';
import { Team } from '../../../../core/model/team';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { LineupService } from '../../services/lineup.service';
import { shareReplay } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PositionChangeModalComponent } from '../../../../shared/modal/position-change-modal/position-change-modal.component';
import { LineupPosition } from './lineup-team-part/lineup-team-part.component';
import { TippyInstance } from '@ngneat/helipopper/config';

@Component({
  selector: 'app-lineup',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.scss'],
  standalone: false,
})
export class LineupComponent implements OnInit {
  team: Team | undefined;
  teamPart: 'offense' | 'defense' | 'special' = 'offense';
  activeLineupOff = 'TE';
  activeLineupDef = 'NT';

  @ViewChild('tpAutoLineup')
  tpAutoLineup: TippyInstance | undefined;

  constructor(
    private readonly dialog: MatDialog,
    private readonly teamService: TeamService,
    private readonly lineupService: LineupService
  ) {
    this.teamService.team$.subscribe(team => {
      if (team) {
        this.team = team;
        this.initializeLineupSettings();
      }
    });
  }

  ngOnInit() {
    console.log('LineupComponent initialized');
  }

  updateLineupOff(event: MatSlideToggleChange) {
    if (event.checked) {
      this.updateLineupPosition('FB');
    } else {
      this.updateLineupPosition('TE');
    }
  }

  updateLineupDef(event: MatSlideToggleChange) {
    if (event.checked) {
      this.updateLineupPosition('MLB');
    } else {
      this.updateLineupPosition('NT');
    }
  }

  updateLineupPosition(lineupPosition: string) {
    this.lineupService
      .updateLineupPosition(lineupPosition)
      .pipe(shareReplay())
      .subscribe(isUpdated => {
        if (isUpdated) {
          console.log(isUpdated);
          this.activeLineupOff = lineupPosition === 'FB' ? 'FB' : 'TE';
          this.activeLineupDef = lineupPosition === 'MLB' ? 'MLB' : 'NT';
        }
      });
  }

  autoLineup() {
    this.lineupService
      .autoLineup()
      .pipe(shareReplay())
      .subscribe(response => {
        if (response.playersLinedUp) {
          this.teamService.updateTeam();
          this.tpAutoLineup?.hide();
        }
      });
  }

  openChangePositionModal(lineupPosition: LineupPosition) {
    // LineupPosition is the position in the lineup, e.g. 'TE', 'FB', 'NT', 'MLB' - MLB1 or MLB2 changes to MLB
    this.openDialog(lineupPosition);
  }

  private initializeLineupSettings() {
    if (this.team?.lineupOff === 'TE') {
      this.activeLineupOff = 'TE';
    } else if (this.team?.lineupOff === 'FB') {
      this.activeLineupOff = 'FB';
    }
    if (this.team?.lineupDef === 'NT') {
      this.activeLineupDef = 'NT';
    } else if (this.team?.lineupDef === 'MLB') {
      this.activeLineupDef = 'MLB';
    }
  }

  private openDialog(lineupPosition: LineupPosition) {
    this.dialog.open(PositionChangeModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      exitAnimationDuration: 0,
      minWidth: '50vw',
      maxHeight: '90vh',
      position: { top: '50px' },
      data: {
        position: lineupPosition.position,
        lineupPosition: lineupPosition.lineupPosition,
      },
    });
  }
}
