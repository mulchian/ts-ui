import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { LineupService } from '../../../features/team/services/lineup.service';
import { first, shareReplay } from 'rxjs';
import { Player } from '../../../core/model/player';
import { PlayerCardModalComponent } from '../player-card-modal/player-card-modal.component';
import { PositionPlayers } from '../../../core/model/position-players';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { LoadingService } from '../../loading/loading.service';
import { TeamService } from '../../../core/services/team.service';

@Component({
  selector: 'app-position-change-modal',
  templateUrl: './position-change-modal.component.html',
  styleUrls: ['./position-change-modal.component.scss'],
  imports: [CommonModule, CdkDropList, CdkDrag, PlayerCardModalComponent, MatGridListModule, MatButtonModule],
  providers: [LineupService],
})
export class PositionChangeModalComponent implements OnInit {
  dialogRef = inject<MatDialogRef<PositionChangeModalComponent>>(MatDialogRef);
  modalHeader: string;
  players: Player[] = [];
  starters: Player[] = [];
  backups: Player[] = [];
  position: string;
  lineupPosition: string;
  countPlayers = 0;
  countStarters = 0;
  countBackups = 0;
  private readonly teamService = inject(TeamService);
  private readonly lineupService = inject(LineupService);
  private readonly loadingService = inject(LoadingService);

  constructor() {
    const data = inject<DialogData>(MAT_DIALOG_DATA);

    this.loadingService.loadingOn();
    this.lineupPosition = data.lineupPosition;
    this.position = data.position;
    this.modalHeader = 'Aufstellung ' + this.lineupPosition;
  }

  maxStartersPredicate = () => {
    return this.countStarters > this.starters.length;
  };

  maxBackupsPredicate = () => {
    return this.countBackups > this.backups.length;
  };

  ngOnInit() {
    this.loadPlayersForPosition(this.position, this.lineupPosition);
  }

  isSpecialTeam(): boolean {
    return this.lineupPosition === 'R';
  }

  drop(event: CdkDragDrop<Player[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  saveLineup() {
    // here is the code to save the lineup changes for the position in the dialog.
    // after saving the dialog should be closed.
    this.lineupService
      .saveLineup(this.starters, this.backups, this.players, this.lineupPosition)
      .pipe(first())
      .subscribe((response: { playersLinedUp: boolean; teamPart: string }) => {
        if (response.playersLinedUp) {
          this.teamService.updateTeam();
          this.dialogRef.close();
        }
      });
  }

  private loadPlayersForPosition(position: string, lineupPosition: string) {
    this.lineupService
      .getLineup(position)
      .pipe(shareReplay(1))
      .subscribe((positionLineup: PositionPlayers) => {
        console.log('PositionLineup:', positionLineup);
        // add players to the drag-and-drop lists (players, starters, backups)
        // use lineupPosition to sort players into the correct lists
        positionLineup.players.forEach(player => {
          if (undefined === player.lineupPosition || null === player.lineupPosition) {
            this.players.push(player);
          } else if (player.lineupPosition === lineupPosition) {
            this.starters.push(player);
          } else if (player.lineupPosition === lineupPosition + 'b') {
            this.backups.push(player);
          } else if (['RB1', 'RB2', 'MLB1', 'MLB2'].includes(player.lineupPosition) && lineupPosition !== 'R') {
            this.starters.push(player);
          }
        });
        this.countPlayers = positionLineup.position.countPlayers;
        this.countStarters = positionLineup.position.countStarters;
        this.countBackups = positionLineup.position.countBackups;
        this.loadingService.loadingOff();
      });
  }
}

export interface DialogData {
  position: string;
  lineupPosition: string;
}
