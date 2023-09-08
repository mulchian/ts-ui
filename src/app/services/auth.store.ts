import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { User } from '../model/user';
import { map, shareReplay, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../shared/loading/loading.service';
import { Router } from '@angular/router';

const AUTH_DATA = 'auth_data';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private subject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.subject.asObservable();

  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly loadingService: LoadingService
  ) {
    this.isLoggedIn$ = this.user$.pipe(map(user => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));

    const user = localStorage.getItem(AUTH_DATA);
    if (user) {
      this.subject.next(JSON.parse(user));
    }
  }

  login(username: string, password: string): Observable<User> {
    this.loadingService.loadingOn();
    return this.http
      .post<User>('/api/user/login.php', { username, password })
      .pipe(
        tap(user => {
          this.loadingService.loadingOff();
          if (user.id) {
            this.subject.next(user);
            localStorage.setItem(AUTH_DATA, JSON.stringify(user));
          } else {
            // PHP is sending an error message instead of an user-object
            throw new Error(JSON.stringify(user));
          }
        }),
        catchError(err => {
          throw err;
        }),
        shareReplay()
      );
  }

  logout() {
    if (this.isLoggedIn$) {
      this.loadingService.loadingOn();
      this.http
        .post('/api/user/logout.php', null)
        .pipe(
          tap(() => {
            this.subject.next(null);
            localStorage.removeItem(AUTH_DATA);
          }),
          shareReplay()
        )
        .subscribe(data => {
          console.log(data);
          console.log('logged out');
          this.router.navigateByUrl('/');
        });
    }
  }

  register(
    username: string,
    email: string,
    password: string
  ): Observable<User> {
    return this.http
      .post<User>('/api/user/register.php', { username, email, password })
      .pipe(
        tap(user => {
          if (user.id) {
            this.subject.next(user);
            localStorage.setItem(AUTH_DATA, JSON.stringify(user));
          } else {
            // PHP is sending an error message instead of a user-object
            throw new Error(JSON.stringify(user));
          }
        }),
        catchError(err => {
          throw err;
        }),
        shareReplay()
      );
  }

  requestNewPasswort(username: string, email: string, link: string) {
    return this.http
      .post<boolean>('/api/user/requestNewPassword.php', {
        username,
        email,
        activationLink: link,
      })
      .pipe(shareReplay());
  }

  changePassword(userId: number, password: string) {
    return this.http
      .post<boolean>('/api/user/changePassword.php', { userId, password })
      .pipe(shareReplay());
  }
}
