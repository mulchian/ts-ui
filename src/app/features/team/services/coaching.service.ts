import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Team } from '../../../core/model/team';
import { CoachingName } from '../../../core/model/coachingName';
import { Coaching } from '../../../core/model/coaching';
import { Observable } from 'rxjs';

@Injectable()
export class CoachingService {
  private http = inject(HttpClient);
  COACHING_URL = '/api/coaching';

  getGameplans(team: Team) {
    return this.http.get<CoachingName[]>(this.COACHING_URL + '/getGameplans.php', {
      params: {
        teamId: team.id,
      },
    });
  }

  getCoachings(team: Team) {
    return this.http.get<Coaching[]>(this.COACHING_URL + '/getCoachings.php', {
      params: {
        teamId: team.id,
      },
    });
  }

  saveCoaching(coaching: Coaching): Observable<{ coachingSaved: boolean }> {
    return this.http.post<{ coachingSaved: boolean }>(this.COACHING_URL + '/saveCoaching.php', {
      coaching: coaching,
    });
  }

  saveCoachingName(coachingName: CoachingName) {
    return this.http.post<{ coachingNameSaved: boolean }>(this.COACHING_URL + '/saveCoachingName.php', {
      coachingName: coachingName,
    });
  }
}
