import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Team } from '../../../../../core/model/team';
import { PositionService } from '../../../services/position.service';
import { Position } from '../../../../../core/model/position';

@Component({
  selector: 'app-lineup-team-part',
  templateUrl: './lineup-team-part.component.html',
  styleUrls: ['./lineup-team-part.component.scss'],
})
export class LineupTeamPartComponent {
  @Input()
  team: Team | null | undefined;
  @Input()
  teamPart: 'offense' | 'defense' | 'special' = 'offense';
  @Input()
  activeLineupPos: string | undefined;
  @Output()
  openChangePositionModal = new EventEmitter<LineupPosition>();

  positions: Position[] | null = [];

  offensePositions: Record<number, LineupPosition[]> = {
    1: [
      { position: 'FB', lineupPosition: 'FB', number: 0 },
      { position: 'QB', lineupPosition: 'QB', number: 0 },
      { position: 'RB', lineupPosition: 'RB1', number: 0 },
    ],
    2: [
      { position: 'TE', lineupPosition: 'TE', number: 0 },
      { position: 'WR', lineupPosition: 'WR', number: 0 },
      { position: 'WR', lineupPosition: 'WR', number: 1 },
      { position: 'WR', lineupPosition: 'WR', number: 2 },
    ],
    3: [
      { position: 'OT', lineupPosition: 'RT', number: 0 },
      { position: 'OG', lineupPosition: 'RG', number: 0 },
      { position: 'C', lineupPosition: 'C', number: 0 },
      { position: 'OG', lineupPosition: 'LG', number: 0 },
      { position: 'OT', lineupPosition: 'LT', number: 0 },
    ],
  };
  defensePositions: Record<number, LineupPosition[]> = {
    1: [
      { position: 'DE', lineupPosition: 'LE', number: 0 },
      { position: 'DT', lineupPosition: 'DT', number: 0 },
      { position: 'DT', lineupPosition: 'NT', number: 0 },
      { position: 'DE', lineupPosition: 'RE', number: 0 },
    ],
    2: [
      { position: 'OLB', lineupPosition: 'LOLB', number: 0 },
      { position: 'MLB', lineupPosition: 'MLB1', number: 0 },
      { position: 'MLB', lineupPosition: 'MLB2', number: 0 },
      { position: 'OLB', lineupPosition: 'ROLB', number: 0 },
    ],
    3: [
      { position: 'CB', lineupPosition: 'CB', number: 0 },
      { position: 'SS', lineupPosition: 'SS', number: 0 },
      { position: 'FS', lineupPosition: 'FS', number: 0 },
      { position: 'CB', lineupPosition: 'CB', number: 1 },
    ],
  };
  specialPositions: LineupPosition[] = [
    { position: 'K', lineupPosition: 'K', number: 0 },
    { position: 'P', lineupPosition: 'P', number: 0 },
    { position: 'R', lineupPosition: 'R', number: 0 },
  ];

  constructor(private readonly positionService: PositionService) {
    this.positionService.positions$.subscribe(positions => {
      this.positions = positions;
    });
  }

  getPlayerForPosition(position: LineupPosition) {
    if (!this.team) {
      return;
    }
    return Object.values(this.team.players).filter(player => player.lineupPosition === position.lineupPosition)[
      position.number
    ];
  }

  openPositionModal(lineupPosition: LineupPosition) {
    // if (lineupPosition.startsWith('MLB') || lineupPosition.startsWith('RB')) {
    //   lineupPosition = lineupPosition.slice(0, -1);
    // }
    this.openChangePositionModal.emit(lineupPosition);
  }

  getPosition(lineupPos: LineupPosition) {
    if (this.positions) {
      return this.positions.filter(pos => {
        let lineupPosition = lineupPos.lineupPosition;
        if (lineupPosition.startsWith('MLB') || lineupPosition.startsWith('RB')) {
          lineupPosition = lineupPosition.slice(0, -1);
        }
        return pos.position === lineupPosition;
      })[0];
    }
    return null;
  }
}

export interface LineupPosition {
  position: string;
  lineupPosition: string;
  number: number;
}
