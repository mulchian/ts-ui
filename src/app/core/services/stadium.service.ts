import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from './auth.store';
import { BehaviorSubject, debounceTime, Observable } from 'rxjs';
import { User } from '../model/user';
import { Stadium } from '../model/stadium';
import { TeamService } from './team.service';

@Injectable()
export class StadiumService {
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
    this.teamService.team$.pipe(debounceTime(500)).subscribe(team => {
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
          .subscribe(stadium => {
            if (stadium) {
              console.log('Stadium fetched from service.');
              this.subject.next(stadium);
            } else {
              // PHP is sending an error message instead of a user-object
              throw new Error(JSON.stringify(user));
            }
          });
      }
    });
  }
}
