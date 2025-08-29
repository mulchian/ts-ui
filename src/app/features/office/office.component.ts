import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { first, Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../shared/loading/loading.service';
import { TeamService } from '../../core/services/team.service';
import { Building, BuildingEffect } from '../../core/model/building';
import { MatDivider } from '@angular/material/divider';
import { FinanceSummary } from '../../core/model/finance';
import { FinanceService } from './services/finance.service';
import { Stadium } from '../../core/model/stadium';
import moment from 'moment-timezone';
import { StadiumService } from './services/stadium.service';
import { MatButton } from '@angular/material/button';
import { GameEvent } from '../../core/model/game-event';
import { EventService } from './services/event.service';

@Component({
  selector: 'app-office',
  templateUrl: './office.component.html',
  styleUrls: ['./office.component.scss'],
  imports: [CommonModule, RouterOutlet, MatCardModule, MatDivider, MatButton, RouterLink],
  providers: [TeamService, FinanceService, StadiumService, EventService],
})
export class OfficeComponent implements OnInit {
  employeeCount = signal<number | null>(null);
  employeeSalary = signal<number | null>(null);
  financeSummary = signal<FinanceSummary | null>(null);
  stadium: Stadium | undefined;
  officeEffect: BuildingEffect | undefined;
  friendlies: GameEvent[] = [];

  private readonly unsubscribe$ = new Subject<void>();
  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly teamService = inject(TeamService);
  private readonly stadiumService = inject(StadiumService);
  private readonly financeService = inject(FinanceService);
  private readonly eventService = inject(EventService);

  showOverview(): boolean {
    return this.router.url === '/office';
  }

  ngOnInit() {
    this.loadingService.loadingOn();
    this.financeService.summary$.pipe(takeUntil(this.unsubscribe$)).subscribe(summary => {
      this.financeSummary.set(summary);
    });
    this.teamService.team$.pipe(takeUntil(this.unsubscribe$)).subscribe(team => {
      if (team) {
        team.stadium.buildings
          .filter(building => building.upgradeTime)
          .forEach(building => {
            this.stadiumService.startBuildingCountdown(building);
          });
        team.stadium.stands
          .filter(stand => stand.upgradeTime)
          .forEach(stand => {
            this.stadiumService.startStandCountdown(stand);
          });

        this.stadium = team.stadium;
        this.employeeCount.set(team.employees.length);
        this.employeeSalary.set(
          team.employees.reduce((salary, employee) => salary + (employee.contract?.salary ?? 0), 0)
        );

        const officeBuilding = team.stadium.buildings.find(building => building.name === 'Bürogebäude');
        const officeBuildingLevel = officeBuilding?.buildingLevels.find(bl => bl.level === officeBuilding?.level);
        this.officeEffect = officeBuildingLevel?.buildingEffects?.find(effect =>
          effect.name.startsWith('Maximale Mitarbeiter')
        );

        this.eventService
          .loadAllFriendlies(false)
          .pipe(first())
          .subscribe(friendlies => {
            Promise.resolve().then(() => {
              queueMicrotask(() => {
                this.eventService.filterAndDeleteOldFriendlies(friendlies, team.name);
              });
            });
            this.friendlies = friendlies.slice(0, 3);
          });
      }
      this.loadingService.loadingOff();
    });
  }

  getAcceptedCount(friendly: any) {
    let acceptedCount = 0;
    if (friendly.homeAccepted) acceptedCount++;
    if (friendly.awayAccepted) acceptedCount++;
    return acceptedCount + '/2';
  }

  getRunningStandUpgrades() {
    return (
      this.stadium?.stands.filter(stand => {
        return stand.upgradeTime?.isAfter(moment().tz('Europe/Berlin')) ?? false;
      }) ?? []
    );
  }

  getRunningBuildingUpgrades() {
    return (
      this.stadium?.buildings.filter(building => {
        return building.upgradeTime?.isAfter(moment().tz('Europe/Berlin')) ?? false;
      }) ?? []
    );
  }

  getStadiumCapacity() {
    if (!this.stadium) return 0;
    return this.stadium.stands.reduce((total, stand) => total + stand.capacity, 0);
  }

  getStadiumMaintenanceCost() {
    if (!this.stadium) return 0;
    return this.stadium.stands.reduce((total, stand) => {
      return total + stand.capacity * stand.ticketPrice * 0.1;
    }, 0);
  }

  getBuildingsMaintenanceCost() {
    if (!this.stadium) return 0;
    return (
      this.stadium.buildings.reduce((total, building) => {
        return total + this.getMaintenanceCost(building);
      }, 0) / 28
    );
  }

  getTotalMaintenanceCost() {
    return this.getStadiumMaintenanceCost() + this.getBuildingsMaintenanceCost();
  }

  private getMaintenanceCost(building: Building) {
    const buildingLevel = building.buildingLevels.find(
      buildingLevel => buildingLevel.idBuilding === building.id && buildingLevel.level === building.level
    );
    return buildingLevel ? buildingLevel.price * 0.1 : 0;
  }
}
