import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PositionLineup } from '../../../core/model/position-lineup';
import { Player } from '../../../core/model/player';
import { Observable } from 'rxjs';

@Injectable()
export class LineupService {
  LINEUP_URL = '/api/lineup';
  constructor(private http: HttpClient) {}

  updateLineupPosition(lineupPosition: string) {
    return this.http.post(this.LINEUP_URL + '/updateLineupPosition.php', { lineupPosition });
  }

  getLineup(position: string) {
    return this.http.get<PositionLineup>(this.LINEUP_URL + '/getLineup.php', {
      params: {
        position: position,
      },
    });
  }

  saveLineup(
    starters: Player[],
    backups: Player[],
    players: Player[],
    lineupPosition: string
  ): Observable<{
    playersLinedUp: boolean;
    teamPart: string;
  }> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.http.post(this.LINEUP_URL + '/saveLineup.php', {
      starters: starters,
      backups: backups,
      players: players,
      lineupPosition: lineupPosition,
    });
  }

  autoLineup(): Observable<{ playersLinedUp: boolean }> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.http.post(this.LINEUP_URL + '/autoLineup.php', {});
  }
}
