import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CoachingName } from '../../../core/model/coachingName';
import { Coaching } from '../../../core/model/coaching';
import { Observable } from 'rxjs';

@Injectable()
export class CoachingService {
  private http = inject(HttpClient);
  COACHING_URL = '/api/coaching';

  saveCoaching(coaching: Coaching): Observable<{ coachingSaved: boolean }> {
    return this.http.post<{ coachingSaved: boolean }>(this.COACHING_URL + '/saveCoaching.php', {
      coaching: coaching,
    });
  }

  changeFieldGoalRange(generalCoaching: Coaching, newRange: string) {
    return this.http.post<{ fieldGoalRangeUpdated: boolean; error: string }>(
      this.COACHING_URL + '/changeFieldGoalRange.php',
      {
        generalCoaching: generalCoaching,
        newRange: newRange,
      }
    );
  }

  saveCoachingName(coachingName: CoachingName) {
    return this.http.post<{ coachingNameSaved: boolean }>(this.COACHING_URL + '/saveCoachingName.php', {
      coachingName: coachingName,
    });
  }

  updateActiveGameplan(teamPart: 'general' | 'offense' | 'defense', selectedGameplanNr: number) {
    return this.http.post<{ gameplanUpdated: boolean }>(this.COACHING_URL + '/updateActiveGameplan.php', {
      teamPart: teamPart,
      gameplanNr: selectedGameplanNr,
    });
  }

  createNewGameplan(teamPart: 'general' | 'offense' | 'defense', gameplanNr: number) {
    return this.http.post<{ gameplanCreated: boolean; error: string | undefined }>(
      this.COACHING_URL + '/addCoaching.php',
      {
        teamPart: teamPart,
        gameplanNr: gameplanNr,
      }
    );
  }

  removeGameplan(teamPart: 'general' | 'offense' | 'defense', gameplanNr: number) {
    return this.http.post<{ gameplanRemoved: boolean; error: string }>(this.COACHING_URL + '/removeCoaching.php', {
      teamPart: teamPart,
      gameplanNr: gameplanNr,
    });
  }
}
