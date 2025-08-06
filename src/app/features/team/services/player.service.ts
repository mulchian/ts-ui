import { inject, Injectable } from '@angular/core';
import { catchError, first } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Player } from '../../../core/model/player';

@Injectable()
export class PlayerService {
  private http = inject(HttpClient);

  updateMinContractMoral(playerId: number, minContractMoral: number) {
    return this.http.post<{ isUpdated: boolean; error?: string }>('/api/player' + '/updateMinContractMoral.php', {
      playerId,
      minContractMoral,
    });
  }

  negotiateContract(player: Player, timeOfContract: string, newSalary: number) {
    return this.http
      .post<{ isNegotiated: boolean; error?: string }>('/api/player' + '/negotiateContract.php', {
        playerId: player.id,
        timeOfContract,
        newSalary,
      })
      .pipe(
        first(),
        catchError(error => {
          throw new Error(JSON.stringify(error));
        })
      );
  }
}
