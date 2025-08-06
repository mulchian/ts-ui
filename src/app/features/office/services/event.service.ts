import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameEvent } from '../../../core/model/game-event';
import { Subject, takeUntil, tap } from 'rxjs';
import moment from 'moment-timezone';
import { map } from 'rxjs/operators';

@Injectable()
export class EventService implements OnDestroy {
  unsubscribe$ = new Subject<void>();
  private readonly EVENT_URL = '/api/event';
  private readonly http = inject(HttpClient);

  constructor() {}

  ngOnDestroy() {
    console.log('EventService destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadAllFriendlies() {
    return this.http.get<GameEvent[]>(this.EVENT_URL + '/getFriendlies.php').pipe(
      tap(friendlies => {
        console.log('All friendlies loaded:', friendlies);
      }),
      map(friendlies => {
        if (friendlies) {
          return friendlies.map(friendly => ({
            ...friendly,
            gameTime: moment.tz(friendly.gameTime, 'Europe/Berlin'),
          }));
        }
        return friendlies;
      }),
      takeUntil(this.unsubscribe$)
    );
  }

  addFriendly(friendly: GameEvent) {
    return this.http
      .post<{ added: boolean; friendly?: GameEvent; error?: string }>(this.EVENT_URL + '/addFriendly.php', {
        friendly: {
          ...friendly,
          gameTime: moment.tz(friendly.gameTime, 'Europe/Berlin').format('YYYY-MM-DD HH:mm:ss'),
        },
      })
      .pipe(
        map(response => {
          if (response.added && response.friendly) {
            return {
              ...response,
              friendly: {
                ...response.friendly,
                gameTime: moment.tz(response.friendly.gameTime, 'Europe/Berlin'),
              },
            };
          }
          return response;
        })
      );
  }

  acceptFriendly(friendly: GameEvent) {
    return this.http
      .post<{ accepted: boolean; error?: string }>(this.EVENT_URL + '/acceptFriendly.php', {
        friendly: {
          ...friendly,
          gameTime: moment.tz(friendly.gameTime, 'Europe/Berlin').format('YYYY-MM-DD HH:mm:ss'),
        },
      })
      .pipe(
        tap(response => {
          console.log('Friendly accepted:', response);
        })
      );
  }

  declineFriendly(friendly: GameEvent) {
    return this.http
      .post<{ declined: boolean; error?: string }>(this.EVENT_URL + '/declineFriendly.php', {
        friendly: {
          ...friendly,
          gameTime: moment.tz(friendly.gameTime, 'Europe/Berlin').format('YYYY-MM-DD HH:mm:ss'),
        },
      })
      .pipe(
        tap(response => {
          console.log('Friendly declined:', response);
        })
      );
  }
}
