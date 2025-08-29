import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { User } from '../model/user';
import { map, shareReplay, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../shared/loading/loading.service';
import { Router } from '@angular/router';
import moment from 'moment-timezone';

const AUTH_DATA = 'auth_data';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);

  private subject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.subject.asObservable();

  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;

  constructor() {
    this.loadStorageUser();
    this.isLoggedIn$ = this.user$.pipe(map(user => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));

    // first we have to ask for the php session
    this.isReloginNeeded().subscribe(needsRelogin => {
      if (needsRelogin) {
        this.subject.next(null);
        localStorage.removeItem(AUTH_DATA);
        this.router.navigateByUrl('/login');
      }
    });
  }

  login(username: string, password: string) {
    this.loadingService.loadingOn();
    return this.http.post<{ user: User; error?: string }>('/api/user/login.php', { username, password }).pipe(
      map(response => {
        if (response.user) {
          return {
            ...response,
            user: {
              ...response.user,
              birthday: moment.tz(response.user.birthday, 'Europe/Berlin'),
              registerDate: moment.tz(response.user.registerDate, 'Europe/Berlin'),
              lastActiveTime: moment.tz(response.user.lastActiveTime, 'Europe/Berlin'),
            },
          };
        }
        return response;
      }),
      tap(response => {
        this.loadingService.loadingOff();
        if (response.user) {
          this.saveUserInSession(response.user);
        } else {
          // PHP is sending an error message instead of an user-object
          throw new Error(response.error);
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

  register(username: string, email: string, password: string, activationLink: string) {
    return this.http
      .post<{
        registered: boolean;
        user?: User;
        error?: string;
      }>('/api/user/register.php', { username, email, password, activationLink })
      .pipe(
        map(response => {
          if (response.registered && response.user) {
            return {
              ...response,
              user: {
                ...response.user,
                birthday: moment.tz(response.user.birthday, 'Europe/Berlin'),
                registerDate: moment.tz(response.user.registerDate, 'Europe/Berlin'),
                lastActiveTime: moment.tz(response.user.lastActiveTime, 'Europe/Berlin'),
              },
            };
          } else {
            return response;
          }
        }),
        tap(response => {
          if (response.registered && response.user) {
            this.saveUserInSession(response.user);
          } else {
            console.error('Registration failed:', response.error);
          }
        }),
        catchError(err => {
          throw err;
        }),
        shareReplay()
      );
  }

  activateUser(idUser: number) {
    return this.http
      .post<{ activated: boolean; user?: User; error?: string }>('/api/user/activate.php', { idUser })
      .pipe(
        map(response => {
          if (response.activated && response.user) {
            return {
              ...response,
              user: {
                ...response.user,
                birthday: moment.tz(response.user.birthday, 'Europe/Berlin'),
                registerDate: moment.tz(response.user.registerDate, 'Europe/Berlin'),
                lastActiveTime: moment.tz(response.user.lastActiveTime, 'Europe/Berlin'),
              },
            };
          } else {
            return response;
          }
        }),
        tap(response => {
          if (response.activated && response.user) {
            this.saveUserInSession(response.user);
          } else {
            console.error('Registration failed:', response.error);
          }
        })
      );
  }

  requestNewActivationLink(email: string, link: string) {
    return this.http.post<boolean>('/api/user/requestNewActivationLink.php', {
      email,
      activationLink: link,
    });
  }

  requestNewPasswort(username: string, email: string, link: string) {
    return this.http.post<boolean>('/api/user/requestNewPassword.php', {
      username,
      email,
      activationLink: link,
    });
  }

  changePassword(userId: number, password: string) {
    return this.http.post<boolean>('/api/user/changePassword.php', { userId, password });
  }

  private saveUserInSession(user: User) {
    this.subject.next(user);
    const userToStore = {
      ...user,
      birthday: user.birthday?.toISOString() ?? null,
      registerDate: user.registerDate.toISOString(),
      lastActiveTime: user.lastActiveTime?.toISOString() ?? null,
    };
    localStorage.setItem(AUTH_DATA, JSON.stringify(userToStore));
  }

  private loadStorageUser() {
    const storageUser = localStorage.getItem(AUTH_DATA);
    let user: User | null = null;
    if (storageUser) {
      const rawUser = <User>JSON.parse(storageUser);
      user = {
        ...rawUser,
        birthday: moment.tz(rawUser.birthday, 'Europe/Berlin'),
        registerDate: moment.tz(rawUser.registerDate, 'Europe/Berlin'),
        lastActiveTime: moment.tz(rawUser.lastActiveTime, 'Europe/Berlin'),
      };
      // TODO: lastActiveTIme needs to be updated in frontend and backend
      // is lastActiveTime longer than 48 hours we need to login again
      // if (user.lastActiveTime < Date.now() - 172800000) {
      //   user = null;
      // }
    }
    this.subject.next(user);
  }

  private isReloginNeeded() {
    return this.http.get<boolean>('/api/user/needsRelogin.php').pipe(tap(), shareReplay());
  }
}
