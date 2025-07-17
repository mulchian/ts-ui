import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { Team } from '../model/team';
import { AuthStore } from './auth.store';

@Injectable()
export class TeamService {
  private http = inject(HttpClient);
  private auth = inject(AuthStore);

  private subject = new BehaviorSubject<Team | null>(null);
  team$: Observable<Team | null> = this.subject.asObservable();

  constructor() {
    this.auth.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn && !this.subject.getValue()) {
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
    console.log('Update team');
    this.loadTeam();
  }
}
