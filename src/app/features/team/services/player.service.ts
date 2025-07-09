import { Injectable, inject } from '@angular/core';
import { catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Player } from '../../../core/model/player';

@Injectable()
export class PlayerService {
  private http = inject(HttpClient);

  updateMinContractMoral(playerId: number, minContractMoral: number) {
    return this.http.post('/api/player' + '/updateMinContractMoral.php', { playerId, minContractMoral });
  }

  negotiateContract(player: Player, timeOfContract: string, newSalary: number) {
    return this.http
      .post('/api/player' + '/negotiateContract.php', {
        playerId: player.id,
        timeOfContract,
        newSalary,
      })
      .pipe(
        catchError(error => {
          throw new Error(JSON.stringify(error));
        })
      );
  }
}
