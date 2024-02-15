import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { Team } from '../../../model/team';
import { AuthStore } from '../../../services/auth.store';

@Injectable()
export class TeamService {
  private subject = new BehaviorSubject<Team | null>(null);
  team$: Observable<Team | null> = this.subject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthStore
  ) {
    this.auth.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn && !this.subject.getValue()) {
        console.log(this.subject.getValue());
        console.log('Load team from service');
        this.loadTeam();
      } else if (!loggedIn) {
        console.log('Reset team');
        this.subject.next(null);
      }
    });
  }

  private loadTeam() {
    this.http
      .get<Team>('/api/team' + '/getTeam.php')
      .pipe(shareReplay())
      .subscribe(team => {
        console.log('Team', team);
        this.subject.next(team);
      });
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

  updateTeam() {
    this.subject.next(null);
    this.loadTeam();
  }
}
