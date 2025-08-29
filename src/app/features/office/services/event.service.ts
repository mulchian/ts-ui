import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameEvent } from '../../../core/model/game-event';
import { BehaviorSubject, first, Observable, Subject, takeUntil, tap } from 'rxjs';
import moment from 'moment-timezone';
import { map } from 'rxjs/operators';

@Injectable()
export class EventService implements OnDestroy {
  loadLiveGamesInterval: any;
  unsubscribe$ = new Subject<void>();
  private readonly EVENT_URL = '/api/event';
  private readonly http = inject(HttpClient);

  private subject = new BehaviorSubject<GameEvent[] | null>(null);
  liveGames$: Observable<GameEvent[] | null> = this.subject.asObservable();

  constructor() {
    this.loadLiveGames();
    // Refresh live games every 5 minutes
    this.loadLiveGamesInterval = setInterval(
      () => {
        this.loadLiveGames();
      },
      5 * 60 * 1000
    );
  }

  ngOnDestroy() {
    clearInterval(this.loadLiveGamesInterval);
    console.log('EventService destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadLiveGames() {
    this.http
      .get<GameEvent[]>(this.EVENT_URL + '/getLiveGames.php')
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(liveGames => {
          console.log('Live games loaded:', liveGames);
        }),
        map(liveGames => {
          if (liveGames && liveGames.length > 0) {
            return liveGames.map(game => ({
              ...game,
              gameTime: moment.tz(game.gameTime, 'Europe/Berlin'),
            }));
          }
          return liveGames;
        })
      )
      .subscribe(games => {
        this.subject.next(games);
      });
  }

  loadAllFriendlies(onlyPlanned: boolean = true) {
    return this.http
      .get<GameEvent[]>(this.EVENT_URL + '/getFriendlies.php', {
        params: { onlyPlanned },
      })
      .pipe(
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

  filterAndDeleteOldFriendlies(friendlies: GameEvent[], teamName: string) {
    if (friendlies?.length > 0) {
      const friendliesToDelete = friendlies.filter((friendly: GameEvent) => {
        return (
          !this.isLive(friendly) &&
          this.isCancelable(friendly, teamName) &&
          !this.isAcceptableOrDeclinable(friendly, teamName)
        );
      });
      if (friendliesToDelete.length > 0) {
        console.log(`Found ${friendliesToDelete.length} old friendlies to delete.`);

        friendliesToDelete.forEach(friendly => {
          this.declineFriendly(friendly)
            .pipe(first())
            .subscribe(res => {
              if (res.declined) {
                console.log(`Friendly with ID ${friendly.id} has been deleted.`);
              }
            });
        });

        return friendliesToDelete;
      }
    }
    return [];
  }

  isLive(friendly: GameEvent) {
    const liveStart = friendly.gameTime.clone().subtract(1, 'h');
    const liveEnd = friendly.gameTime.clone().add(3, 'h');
    return (
      friendly.result === null &&
      moment().isBetween(liveStart, liveEnd) &&
      friendly.homeAccepted &&
      friendly.awayAccepted
    );
  }

  isCancelable(friendly: GameEvent, teamName: string) {
    const gameTime = friendly.gameTime.clone();
    const nowInOneHour = moment().add(1, 'h');
    const selfHasAccepted =
      (friendly.home === teamName && friendly.homeAccepted) || (friendly.awayAccepted && friendly.away === teamName);
    return selfHasAccepted && gameTime.subtract(20, 'm').isAfter(nowInOneHour);
  }

  isAcceptableOrDeclinable(friendly: GameEvent, teamName: string) {
    const isHome = friendly.home === teamName;
    const isAccepted = isHome ? friendly.homeAccepted : friendly.awayAccepted;
    const isOpponentAccepted = isHome ? friendly.awayAccepted : friendly.homeAccepted;
    const gameTime = friendly.gameTime.clone();
    const nowInOneHour = moment().add(1, 'h');
    return isOpponentAccepted && !isAccepted && gameTime.subtract(20, 'm').isAfter(nowInOneHour);
  }
}
