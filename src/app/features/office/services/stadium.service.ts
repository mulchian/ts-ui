import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../../../services/auth.store';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../../model/user';
import { Stadium } from '../../../model/stadium';

@Injectable({ providedIn: 'root' })
export class StadiumService {
  private subject = new BehaviorSubject<Stadium | null>(null);
  stadium$: Observable<Stadium | null> = this.subject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthStore
  ) {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.loadStadium(user);
      }
    });
  }

  private loadStadium(user: User) {
    this.http
      .get<Stadium>('/api/stadium' + '/getStadium.php', {
        params: {
          userId: user.id,
        },
      })
      .subscribe(stadium => {
        this.subject.next(stadium);
      });
  }
}
