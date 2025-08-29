import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay, Subject, takeUntil } from 'rxjs';
import { Team } from '../model/team';
import { AuthStore } from './auth.store';
import { map, tap } from 'rxjs/operators';
import moment from 'moment-timezone';

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
      map(team => {
        return {
          ...team,
          stadium: {
            ...team.stadium,
            buildings: team.stadium.buildings.map(building => {
              return {
                ...building,
                upgradeTime: building.upgradeTime ? moment.tz(building.upgradeTime, 'Europe/Berlin') : null,
              };
            }),
            stands: team.stadium.stands.map(stand => {
              return {
                ...stand,
                upgradeTime: stand.upgradeTime ? moment.tz(stand.upgradeTime, 'Europe/Berlin') : null,
              };
            }),
          },
        };
      }),
      tap(team => {
        console.log('Team loaded', team);
        this.subject.next(team);
      }),
      shareReplay(1),
      takeUntil(this.unsubscribe$)
    );
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

  getConferenceRecommendation(country: string = 'Deutschland') {
    return this.http
      .get<'North' | 'South'>(this.TEAM_URL + '/getConferenceRecommendation.php', {
        params: { country },
      })
      .pipe(
        tap(reco => {
          console.log('Conference recommendation:', reco);
        })
      );
  }

  isTeamNameTaken(name: string): Observable<boolean> {
    return this.http
      .get<{ isTaken: boolean }>(this.TEAM_URL + '/isTeamNameTaken.php', {
        params: { name },
      })
      .pipe(
        map(response => response.isTaken),
        tap(isTaken => {
          console.log(`Team name "${name}" is taken: ${isTaken}`);
        })
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

  createTeam(name: string, abbreviation: string, conference: 'North' | 'South') {
    return this.http
      .post<{ teamCreated: boolean; team?: Team; error?: string }>(this.TEAM_URL + '/createTeam.php', {
        name,
        abbreviation,
        conference,
      })
      .pipe(
        map(response => {
          if (response.teamCreated && response.team) {
            const team = {
              ...response.team,
              stadium: {
                ...response.team.stadium,
                buildings: response.team.stadium.buildings.map(building => ({
                  ...building,
                  upgradeTime: building.upgradeTime ? moment.tz(building.upgradeTime, 'Europe/Berlin') : null,
                })),
              },
            };
            this.subject.next(team);
            return {
              ...response,
              team: team,
            };
          }
          return response;
        }),
        tap(response => {
          if (response.teamCreated) {
            console.log('Team created successfully:', response);
          } else {
            console.error('Failed to create team');
          }
        })
      );
  }
}
