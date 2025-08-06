import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../../../core/services/auth.store';
import { BehaviorSubject, debounceTime, first, Observable, Subject, takeUntil } from 'rxjs';
import { User } from '../../../core/model/user';
import { Stadium } from '../../../core/model/stadium';
import { TeamService } from '../../../core/services/team.service';

@Injectable()
export class StadiumService {
  unsubscribe$ = new Subject<void>();
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthStore);
  private readonly teamService = inject(TeamService);
  private subject = new BehaviorSubject<Stadium | null>(null);
  stadium$: Observable<Stadium | null> = this.subject.asObservable();

  constructor() {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.loadStadium(user);
      }
    });
  }

  private loadStadium(user: User) {
    // first get team (TeamService) and check if there is a stadium
    // second get stadium directly from database
    this.teamService.team$.pipe(debounceTime(500), takeUntil(this.unsubscribe$)).subscribe(team => {
      if (team) {
        console.log('Stadium fetched from team.');
        this.subject.next(team.stadium);
      } else {
        this.http
          .get<Stadium>('/api/stadium' + '/getStadium.php', {
            params: {
              userId: user.id,
            },
          })
          .pipe(first())
          .subscribe(stadium => {
            if (stadium) {
              console.log('Stadium fetched from service.');
              this.subject.next(stadium);
            } else {
              // PHP is sending an error message instead of a stadium-object
              throw new Error(JSON.stringify(stadium));
            }
          });
      }
    });
  }
}
