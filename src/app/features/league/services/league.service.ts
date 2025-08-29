import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, first, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { League } from '../../../core/model/league';
import { LeagueStandings } from '../../../core/model/standing';
import { tap } from 'rxjs/operators';

@Injectable()
export class LeagueService implements OnDestroy {
  unsubscribe$ = new Subject<void>();
  private readonly LEAGUE_URL = '/api/league';
  private readonly http = inject(HttpClient);
  private leaguesSubject = new BehaviorSubject<League[] | null>(null);
  leagues$: Observable<League[] | null> = this.leaguesSubject.asObservable();
  private standingsSubject = new BehaviorSubject<LeagueStandings[] | null>(null);
  standings$: Observable<LeagueStandings[] | null> = this.standingsSubject.asObservable();

  constructor() {
    this.loadLeagues();
    this.loadStandings();
  }

  ngOnDestroy() {
    console.log('LeagueService destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadLeagues() {
    this.http
      .get<League[]>(this.LEAGUE_URL + '/getLeagues.php')
      .pipe(
        first(),
        tap((leagues: League[]) => {
          console.log('Leagues loaded', leagues);
        })
      )
      .subscribe((leagues: League[]) => {
        this.leaguesSubject.next(leagues);
      });
  }

  loadStandings() {
    this.http
      .get<LeagueStandings[]>(this.LEAGUE_URL + '/getStandings.php')
      .pipe(
        first(),
        tap((standings: LeagueStandings[]) => {
          console.log('Standings loaded', standings);
        })
      )
      .subscribe((leagueStandings: LeagueStandings[]) => {
        this.standingsSubject.next(leagueStandings);
      });
  }
}
