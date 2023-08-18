import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay } from 'rxjs';
import { Team } from '../../model/team';

@Injectable()
export class TeamService {
  constructor(private http: HttpClient) {}

  loadTeam() {
    return this.http
      .get<Team>('/api/team' + '/getTeam.php')
      .pipe(shareReplay());
  }

  loadTeamForUser(userId: number) {
    return this.http
      .get<Team>('/api/team' + '/getTeam.php', {
        params: {
          userId: userId.toString(),
        },
      })
      .pipe(shareReplay());
  }
}
