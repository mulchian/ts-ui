import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, first, Observable, Subject, takeUntil } from 'rxjs';
import { Stadium } from '../../../core/model/stadium';
import { TeamService } from '../../../core/services/team.service';
import { Building } from '../../../core/model/building';
import { map, tap } from 'rxjs/operators';
import moment from 'moment-timezone';
import { Stand } from 'src/app/core/model/stand';

@Injectable()
export class StadiumService implements OnDestroy {
  unsubscribe$ = new Subject<void>();
  private STADIUM_URL = '/api/stadium';
  private readonly http = inject(HttpClient);
  private readonly teamService = inject(TeamService);
  private subject = new BehaviorSubject<Stadium | null>(null);
  stadium$: Observable<Stadium | null> = this.subject.asObservable();

  constructor() {
    this.teamService.team$.pipe(takeUntil(this.unsubscribe$)).subscribe(team => {
      if (team && team.stadium) {
        console.log('Stadium loaded from team service.');
        this.subject.next(team.stadium);
      } else {
        console.log('No stadium found in team service, waiting for user login to load stadium.');
      }
    });
  }

  ngOnDestroy() {
    console.log('StadiumService destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  renameStadium(stadium: Stadium, newName: string) {
    return this.http
      .post<{
        isSaved: boolean;
        error?: string;
      }>(this.STADIUM_URL + '/renameStadium.php', {
        idStadium: stadium.id,
        newName: newName,
      })
      .pipe(
        first(),
        tap(response => {
          if (response.isSaved) {
            console.log('New name saved.', newName);
            stadium.name = newName;
            this.subject.next(stadium);
          } else {
            console.error('Failed to save stadium:', response.error);
          }
        })
      );
  }

  loadAllBuildings(): Observable<Building[]> {
    return this.http.get<Building[]>(this.STADIUM_URL + '/getAllBuildings.php').pipe(
      tap(buildings => {
        console.log(buildings.length + ' Buildings fetched from service.');
      })
    );
  }

  startBuildingUpgrade(building: Building) {
    return this.http
      .post<{
        upgradeStarted: boolean;
        upgradedBuilding: Building;
        error?: string;
      }>(this.STADIUM_URL + '/startBuildingUpgrade.php', {
        idBuilding: building.id,
      })
      .pipe(
        map(response => {
          if (response.upgradedBuilding) {
            return {
              ...response,
              upgradedBuilding: {
                ...response.upgradedBuilding,
                upgradeTime: moment.tz(response.upgradedBuilding?.upgradeTime, 'Europe/Berlin'),
              },
            };
          } else {
            return response;
          }
        }),
        tap(res => {
          if (res.upgradeStarted) {
            console.log('Upgrade started:', res.upgradedBuilding);
          } else {
            console.error('Failed to start upgrade:', res.error);
          }
        })
      );
  }

  loadStadium() {
    this.teamService
      .loadTeam()
      .pipe(first())
      .subscribe(team => {
        if (team) {
          console.log('Stadium fetched from team.');
          this.subject.next(team.stadium);
        }
      });
  }

  renameStand(stand: Stand, newName: string) {
    return this.http
      .post<{
        isSaved: boolean;
        error?: string;
      }>(this.STADIUM_URL + '/renameStand.php', {
        standPosition: stand.position,
        newName: newName,
      })
      .pipe(
        first(),
        tap(response => {
          if (response.isSaved) {
            console.log('Stand renamed.');
            queueMicrotask(() => {
              this.loadStadium();
              this.teamService.updateTeam();
            });
          } else {
            console.error('Failed to save stand:', response.error);
          }
        })
      );
  }

  changeTicketPrice(stand: Stand, newPrice: number) {
    return this.http
      .post<{ isChanged: boolean; error?: string }>(this.STADIUM_URL + '/changeTicketPrice.php', {
        standPosition: stand.position,
        newPrice: newPrice,
      })
      .pipe(
        tap(() => {
          console.log(`Ticket price for stand ${stand.name} changed to ${newPrice}`);
        }),
        map(response => {
          if (response.isChanged) {
            return true;
          } else {
            throw new Error(response.error || 'Failed to change ticket price');
          }
        })
      );
  }

  startStandUpgrade(stand: Stand, quantity: number) {
    return this.http
      .post<{
        upgradeStarted: boolean;
        upgradedStand: Stand;
        error?: string;
      }>(this.STADIUM_URL + '/startStandUpgrade.php', {
        standPosition: stand.position,
        quantity: quantity,
      })
      .pipe(
        map(response => {
          if (response.upgradedStand) {
            return {
              ...response,
              upgradedStand: {
                ...response.upgradedStand,
                upgradeTime: moment.tz(response.upgradedStand?.upgradeTime, 'Europe/Berlin'),
              },
            };
          } else {
            return response;
          }
        }),
        tap(res => {
          if (res.upgradeStarted) {
            console.log('Stand upgrade started:', res.upgradedStand);
          } else {
            console.error('Failed to start stand upgrade:', res.error);
          }
        })
      );
  }

  startBuildingCountdown(building: Building) {
    this.upgradeBuildingUpgradeTime(building); // sofort beim Start

    building.intervalId = setInterval(() => {
      this.upgradeBuildingUpgradeTime(building);
    }, 1000);
  }

  startStandCountdown(stand: Stand) {
    this.upgradeStandUpgradeTime(stand); // sofort beim Start

    stand.intervalId = setInterval(() => {
      this.upgradeStandUpgradeTime(stand);
    }, 1000);
  }

  private upgradeBuildingUpgradeTime(building: Building) {
    const secondsLeft = building.upgradeTime?.diff(moment.tz('Europe/Berlin'), 'seconds');

    if (secondsLeft === undefined || secondsLeft <= 0) {
      building.remainingTime = '00:00';
      clearInterval(building.intervalId);
      this.finishBuildingUpgrade(building);
      return;
    }

    building.remainingTime = this.updateUpgradeTime(secondsLeft);
  }

  private upgradeStandUpgradeTime(stand: Stand) {
    const secondsLeft = stand.upgradeTime?.diff(moment.tz('Europe/Berlin'), 'seconds');

    if (secondsLeft === undefined || secondsLeft <= 0) {
      stand.remainingTime = '00:00';
      clearInterval(stand.intervalId);
      console.debug('Finishing stand upgrade for', stand.name);
      this.finishStandUpgrade(stand);
      return;
    }

    stand.remainingTime = this.updateUpgradeTime(secondsLeft);
  }

  private updateUpgradeTime(secondsLeft: number): string {
    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);
    const minutes = Math.floor(((secondsLeft % 86400) % 3600) / 60);
    const seconds = secondsLeft % 60;

    if (days > 0) {
      return (
        `${this.padZero(days)} ` +
        (days > 1 ? 'Tage' : 'Tag') +
        ` und ${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`
      );
    }
    if (hours > 0) {
      return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
    }
    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  finishBuildingUpgrade(building: Building) {
    console.log(`Building ${building.name} upgrade time is over.`);
    const buildingLevel = building.buildingLevels.find(
      bl => bl.idBuilding === building.id && bl.level === building.level + 1
    );
    if (buildingLevel) {
      building.level += 1; // increase the level
      building.upgradeTime = null; // reset the upgrade time
      console.log(`Building ${building.name} upgraded to level ${building.level}.`);
      Promise.resolve().then(() => {
        queueMicrotask(() => {
          console.log(`Saving upgraded building ${building.name} to the database.`);
          this.upgradeBuilding(building);
        });
      });
    } else {
      console.warn(`No next level found for building ${building.name}.`);
    }
  }

  finishStandUpgrade(stand: Stand) {
    console.log(`Stand ${stand.name} upgrade time is over.`);

    stand.capacity += stand.upgradeAmount;
    stand.upgradeAmount = 0;
    stand.upgradeTime = null;
    Promise.resolve().then(() => {
      queueMicrotask(() => {
        console.log(`Saving upgraded building ${stand.name} to the database.`);
        this.upgradeStand(stand);
      });
    });
  }

  private upgradeBuilding(building: Building) {
    return this.http
      .post<{ isUpgraded: boolean; error?: string }>(this.STADIUM_URL + '/upgradeBuilding.php', {
        idBuilding: building.id,
      })
      .pipe(first())
      .subscribe(res => {
        if (res.isUpgraded) {
          console.log('Building upgraded successfully:', building.name);
          this.teamService.loadTeam();
        } else {
          console.error('Failed to upgrade building:', res.error);
        }
      });
  }

  private upgradeStand(stand: Stand) {
    return this.http
      .post<{ isUpgraded: boolean; error?: string }>(this.STADIUM_URL + '/upgradeStand.php', {
        standPosition: stand.position,
      })
      .pipe(first())
      .subscribe(res => {
        if (res.isUpgraded) {
          console.log('Stand upgraded successfully.');
          this.teamService.loadTeam();
        } else {
          console.error('Failed to upgrade stand:', res.error);
        }
      });
  }
}
