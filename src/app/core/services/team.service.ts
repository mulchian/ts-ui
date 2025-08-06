import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay, Subject, takeUntil } from 'rxjs';
import { Team } from '../model/team';
import { AuthStore } from './auth.store';
import { tap } from 'rxjs/operators';

@Injectable()
export class TeamService implements OnDestroy {
  unsubscribe$ = new Subject<void>();
  private TEAM_URL = '/api/team';
  private http = inject(HttpClient);
  private auth = inject(AuthStore);
  private subject = new BehaviorSubject<Team | null>(null);
  team$: Observable<Team | null> = this.subject.asObservable();

  constructor() {
    this.auth.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn && !this.subject.getValue()) {
        console.log('Load team from service');
        this.loadTeam().subscribe(() => {});
      } else if (!loggedIn) {
        console.log('Reset team');
        this.subject.next(null);
      }
    });
  }

  ngOnDestroy() {
    console.log('TeamService destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadTeam(): Observable<Team | null> {
    return this.http.get<Team>(this.TEAM_URL + '/getTeam.php').pipe(
      tap(team => {
        console.log('Team loaded', team);
        this.subject.next(team);
      }),
      shareReplay(1),
      takeUntil(this.unsubscribe$)
    );
  }

  private loadTeams(country: string | null = null, teamSelectionNum: number = 0): Observable<Team[]> {
    return this.http.get<Team[]>(this.TEAM_URL + '/getTeams.php', {
      params: {
        country: country ?? '',
        teamSelectionNum: teamSelectionNum.toString(),
      },
    });
  }

  loadTeamForUser(userId: number) {
    return this.http
      .get<Team>(this.TEAM_URL + '/getTeam.php', {
        params: {
          userId: userId.toString(),
        },
      })
      .pipe(shareReplay(), takeUntil(this.unsubscribe$));
  }

  updateTeam() {
    console.log('Update team');
    this.loadTeam().subscribe(() => {
      console.log('Team updated.');
    });
  }

  loadActiveTeams(): Observable<Team[]> {
    return this.loadTeams(null, 2);
  }
}
