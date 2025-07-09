import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Player } from '../../../core/model/player';
import { TalentPipe } from '../../pipe/talent.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { LineupPosition } from '../../../features/team/components/lineup/lineup-team-part/lineup-team-part.component';
import { Position } from '../../../core/model/position';

@Component({
  selector: 'app-player-card-modal',
  templateUrl: './player-card-modal.component.html',
  styleUrls: ['./player-card-modal.component.scss'],
  imports: [MatCardModule, MatButtonModule, MatGridListModule, NgClass, TalentPipe],
  providers: [],
})
export class PlayerCardModalComponent {
  @Input() position: Position | null | undefined;
  @Input() player!: Player;
  @Input() activeLineupPos: string | undefined;
  @Input() showChangeButton = true;
  @Input() isSpecialTeam = false;
  @Output() openChangePositionModal = new EventEmitter<LineupPosition>();

  get isActive(): boolean {
    if (this.activeLineupPos === 'MLB') {
      this.activeLineupPos = 'MLB2';
    }

    const invalidCombinations: [string, string][] = [
      ['TE', 'FB'],
      ['FB', 'TE'],
      ['NT', 'MLB2'],
      ['MLB2', 'NT'],
    ];

    const offenseInvalid = invalidCombinations.some(
      ([pos1, pos2]) => this.player?.lineupPosition === pos1 && this.activeLineupPos === pos2
    );

    const defenseInvalid = invalidCombinations.some(
      ([pos1, pos2]) => this.player?.lineupPosition === pos1 && this.activeLineupPos === pos2
    );

    return !offenseInvalid && !defenseInvalid;
  }

  getIsReturner(): boolean {
    if (this.player?.lineupPosition) {
      return this.isSpecialTeam && !['K', 'P'].includes(this.player.lineupPosition);
    } else if (this.isSpecialTeam && this.player) {
      return true;
    }
    return false;
  }

  openDialog() {
    if (this.player?.lineupPosition) {
      const lineupPosition = {
        position: this.getIsReturner() ? 'R' : this.player.type.position.position,
        lineupPosition: this.player.lineupPosition,
        number: 0,
      };
      this.openChangePositionModal.emit(lineupPosition);
    } else if (this.position) {
      const lineupPosition = {
        position: this.position?.position,
        lineupPosition: this.position?.position,
        number: 0,
      };
      this.openChangePositionModal.emit(lineupPosition);
    }
  }
}
