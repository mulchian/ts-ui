import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Team } from '../../../core/model/team';
import { CoachingName } from '../../../core/model/coachingName';
import { Coaching } from '../../../core/model/coaching';
import { Observable } from 'rxjs';

@Injectable()
export class CoachingService {
  COACHING_URL = '/api/coaching';

  constructor(private http: HttpClient) {}

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.http.post(this.COACHING_URL + '/saveCoaching.php', {
      coaching: coaching,
    });
  }
}
