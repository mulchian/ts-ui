import { Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Team } from 'src/app/core/model/team';
import { TeamService } from '../../../../core/services/team.service';
import { debounceTime, EMPTY, filter, first, Subject, switchMap, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatSortModule } from '@angular/material/sort';
import { Stadium } from '../../../../core/model/stadium';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { LoadingService } from '../../../../shared/loading/loading.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { Building } from '../../../../core/model/building';
import { StadiumService } from '../../services/stadium.service';
import { TippyDirective } from '@ngneat/helipopper';
import moment from 'moment-timezone';
import { InputModalComponent } from '../../../../shared/modal/tooltip/input-modal/input-modal.component';
import { Stand, StandPosition } from '../../../../core/model/stand';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { catchError, finalize, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { TippyInstance } from '@ngneat/helipopper/config';

@Component({
  selector: 'app-infrastructure',
  templateUrl: './infrastructure.component.html',
  styleUrl: './infrastructure.component.scss',
  animations: [
    trigger('expandCollapse', [
      state('void', style({ height: '0px', opacity: 0, transform: 'translateY(-8px)' })),
      state('*', style({ height: '*', opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('220ms cubic-bezier(0.2, 0, 0, 1)')),
      transition('* => void', animate('180ms cubic-bezier(0.4, 0, 1, 1)')),
    ]),
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatIconButton,
    MatButton,
    TippyDirective,
    InputModalComponent,
    FormsModule,
    MatSlider,
    MatSliderThumb,
    MatChipsModule,
    ReactiveFormsModule,
  ],
  providers: [TeamService, StadiumService],
})
export class InfrastructureComponent implements OnInit, OnDestroy {
  team: Team | undefined;
  stadium: Stadium | undefined;
  upgradeQuantity: number = 0;
  selectedStand = signal<StandPosition | null>(null);
  ticketPriceDraft = signal<number | null>(null);
  savingStandPrice = signal<boolean>(false);
  savingStandUpgrade = signal<boolean>(false);
  allBuildings: Building[] = [];
  unsubscribe$ = new Subject<void>();
  selected = computed(() => this.selectedStand());
  busy = computed(() => this.savingStandPrice() || this.savingStandUpgrade());
  standMaxBuildCapacity = computed(() => {
    const s = this.getStandForPosition(this.selected());
    return s ? Math.max(0, s.maxCapacity - s.capacity) : 0;
  });
  @ViewChild('cardSlot') cardSlot?: ElementRef<HTMLDivElement>;
  @ViewChild('tpRenameStadium') tpRenameStadium: TippyInstance | undefined;
  @ViewChild('tpRenameStand') tpRenameStand: TippyInstance | undefined;
  protected readonly StandPosition = StandPosition;
  private pending: StandPosition | null = null;
  private isAnimating = false;
  private saveStandPrice$ = new Subject<{ stand: Stand; price: number }>();
  private readonly snack = inject(MatSnackBar);
  private readonly loadingService = inject(LoadingService);
  private readonly teamService = inject(TeamService);
  private readonly stadiumService = inject(StadiumService);

  constructor() {
    this.loadingService.loadingOn();
  }

  ngOnInit(): void {
    this.teamService.team$.pipe(takeUntil(this.unsubscribe$)).subscribe(team => {
      if (team) {
        this.team = team;
      }
    });
    this.stadiumService.stadium$.pipe(takeUntil(this.unsubscribe$)).subscribe(stadium => {
      if (stadium) {
        this.stadium = stadium;
        this.checkOngoingUpgrades();
        this.loadingService.loadingOff();
      }
    });
    this.stadiumService
      .loadAllBuildings()
      .pipe(first())
      .subscribe(buildings => {
        if (buildings && buildings.length > 0) {
          this.allBuildings = buildings;
        }
      });

    this.loadStandChangeListener();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getMaintenanceCost(building: Building) {
    const buildingLevel = building.buildingLevels.filter(
      buildingLevel => buildingLevel.idBuilding === building.id && buildingLevel.level === building.level
    )[0];
    // the maintenance cost is 0 € if the building is not built yet
    // 10% of the price is the maintenance cost
    return buildingLevel ? buildingLevel.price * 0.1 : 0;
  }

  getUpgradeCost(building: Building) {
    const buildingLevel = building.buildingLevels.filter(
      buildingLevel => buildingLevel.idBuilding === building.id && buildingLevel.level === building.level + 1
    )[0];
    // the upgrade cost is 0 € if the building is already at max level
    return buildingLevel ? buildingLevel.price : 0;
  }

  getStandUpgradeCost(stand: Stand) {
    return stand.upgradePricePerSeat * this.upgradeQuantity;
  }

  isUpgradeAllowed(building: Building) {
    if (!this.team) {
      return false;
    }
    const hasEnoughBudget = this.team.budget > this.getUpgradeCost(building);
    const isNotMaxLevel = building.level < building.maxLevel;
    let otherUpgradeInProgress =
      this.stadium?.buildings?.some(b => {
        return b.upgradeTime?.isAfter(moment().tz('Europe/Berlin'));
      }) ?? false;

    // check the building effect of Bauhof -> the effect can mean it's possible to build 2 buildings at the same time
    if (this.hasBuildingEffect('Bauhof', 'Paralleler Ausbau')) {
      const ongoingUpgrades = this.stadium?.buildings?.filter(b =>
        b.upgradeTime?.isAfter(moment().tz('Europe/Berlin'))
      );
      otherUpgradeInProgress = (ongoingUpgrades?.length ?? 0) >= 2;
    }

    // is building_requirement fullfilled?
    let isRequirementFulfilled = true;
    const requiredBuilding = this.getNextBuildingLevel(building)?.requiredBuilding;
    if (requiredBuilding) {
      isRequirementFulfilled =
        this.stadium?.buildings?.some(b => {
          return b.id === requiredBuilding.id && b.level >= requiredBuilding.level;
        }) ?? false;
    }
    return hasEnoughBudget && isNotMaxLevel && !otherUpgradeInProgress && isRequirementFulfilled;
  }

  standExceedsFunds() {
    if (!this.team) return true;
    return this.getStandUpgradeCost(this.getStandForPosition(this.selected())!) > this.team.budget;
  }

  isBeingExpanded(upgradeTime: moment.Moment | null) {
    return upgradeTime ? upgradeTime.isAfter(moment().tz('Europe/Berlin')) : false;
  }

  startBuildingUpgrade(building: Building) {
    this.loadingService.loadingOn();
    // the backend is filtering the building from the stadium and updates the upgradeTime
    this.stadiumService
      .startBuildingUpgrade(building)
      .pipe(first())
      .subscribe(res => {
        if (res.upgradeStarted) {
          console.log('Upgrade started.');
          if (res.upgradedBuilding) {
            const stadiumBuilding = this.stadium?.buildings.find(b => b.id === res.upgradedBuilding.id);
            if (stadiumBuilding) {
              stadiumBuilding.upgradeTime = res.upgradedBuilding.upgradeTime;
              this.stadiumService.startBuildingCountdown(stadiumBuilding);
            }
            this.teamService.updateTeam(); // reload the team to update the budget (mat-chip-component)
            this.stadiumService.loadStadium();
          }
        }
      });
  }

  getNextBuildingLevel(building: Building) {
    return building.buildingLevels.find(bl => bl.idBuilding === building.id && bl.level === building.level + 1);
  }

  getActualBuildingLevel(building: Building) {
    return building.buildingLevels.find(bl => bl.idBuilding === building.id && bl.level === building.level);
  }

  getBuildingForId(idBuilding: number): Building | undefined {
    return this.allBuildings.find(b => b.id === idBuilding);
  }

  renameStadium(newName: string) {
    if (this.stadium) {
      this.stadiumService
        .renameStadium(this.stadium, newName)
        .pipe(first())
        .subscribe(response => {
          if (response.isSaved) {
            console.log('Stadium renamed successfully:', newName);
            this.showSuccess(`Stadion umbenannt in "${newName}".`);
            this.tpRenameStadium?.hide();
          } else {
            console.error('Failed to rename stadium:', response.error);
            this.showError('Stadion konnte nicht umbenannt werden.');
          }
        });
    }
  }

  renameStand(newName: string, stand: Stand) {
    if (!stand) return;
    this.stadiumService
      .renameStand(stand, newName)
      .pipe(first())
      .subscribe(response => {
        if (response.isSaved) {
          console.log(`Stand ${stand.position} renamed successfully.`);
          stand.name = newName;
          this.showSuccess(`Tribüne "${stand.name}" umbenannt.`);
          this.tpRenameStand?.hide();
        } else {
          console.error(`Failed to rename stand ${stand.position}:`, response.error);
          this.showError('Tribüne konnte nicht umbenannt werden.');
        }
      });
  }

  startStandUpgrade() {
    if (this.busy()) return;
    if (!this.selected()) return;
    const stand = this.getStandForPosition(this.selected());
    if (!stand || this.upgradeQuantity <= 0) return;
    if (this.standExceedsFunds()) return;
    if (this.isBeingExpanded(stand.upgradeTime)) return;

    this.savingStandUpgrade.set(true);
    this.stadiumService
      .startStandUpgrade(stand, this.upgradeQuantity)
      .pipe(
        first(),
        tap(res => {
          if (res.upgradeStarted) {
            const standPosition = this.selectedStand();
            if (standPosition) {
              this.upgradeStandByPosition(standPosition, res.upgradedStand);
              if (res.upgradedStand && res.upgradedStand.position === standPosition) {
                this.stadiumService.startStandCountdown(res.upgradedStand);
              }
              this.teamService.updateTeam();
              this.stadiumService.loadStadium();
              this.upgradeQuantity = 0;
              this.showSuccess(`Tribünenausbau "${stand.name}" erfolgreich gestartet.`);
            }
          }
        }),
        catchError(() => {
          this.showError('Tribünenausbau konnte nicht gestartet werden.');
          return EMPTY;
        }),
        finalize(() => this.savingStandUpgrade.set(false))
      )
      .subscribe();
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

  toggleStand(standPosition: StandPosition) {
    console.log(`Toggling stand: ${standPosition}`);
    if (this.selectedStand() === standPosition) {
      this.selectedStand.set(null);
      this.ticketPriceDraft.set(null);
      return;
    }
    if (this.selectedStand() && this.selectedStand() !== standPosition) {
      if (this.isAnimating) return; // while animating no new movement
      this.pending = standPosition;
      this.isAnimating = true;
      this.selectedStand.set(null);
      this.ticketPriceDraft.set(null);
      return;
    }

    this.pending = null;
    this.selectedStand.set(standPosition);
    this.ticketPriceDraft.set(this.getStandForPosition(standPosition)?.ticketPrice ?? null);
    queueMicrotask(() => {
      this.cardSlot?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  onCardAnimationDone(e: any) {
    if (e.toState === 'void' && this.pending) {
      const next = this.pending;
      this.pending = null;
      this.selectedStand.set(next);
      this.ticketPriceDraft.set(this.getStandForPosition(next)?.ticketPrice ?? null);
      queueMicrotask(() => {
        this.cardSlot?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
    this.isAnimating = false;
  }

  onMaxAffordable() {
    const stand = this.getStandForPosition(this.selected());
    const afford = Math.floor((this.team?.budget ?? 0) / stand!.upgradePricePerSeat);
    const value = Math.min(afford, this.standMaxBuildCapacity());
    this.onUpgradeQuantityChange(value);
  }

  onUpgradeQuantityChange(value: number) {
    // we need to clamp the value to the range [0, maxCapacity - currentCapacity]
    // this is to prevent going over the value with using the mat-chip-buttons
    const clamped = Math.max(0, Math.min(value ?? 0, this.standMaxBuildCapacity()));
    if (clamped !== this.upgradeQuantity) this.upgradeQuantity = clamped;
  }

  isSelected(standPosition: StandPosition) {
    return this.selectedStand() === standPosition;
  }

  clearSelection() {
    this.selectedStand.set(null);
  }

  getStandForPosition(standPosition: StandPosition | null) {
    return this.stadium?.stands?.find(stand => stand.position === standPosition) ?? null;
  }

  formatPriceLabel(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  onDraftChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.ticketPriceDraft.set(Number(input.value));
  }

  commitTicketPrice(stand: Stand) {
    const draft = this.ticketPriceDraft();
    if (draft == null || draft === stand.ticketPrice) return;
    this.saveStandPrice$.next({ stand: stand, price: draft });
  }

  getRunningStandUpgrades() {
    return (
      this.stadium?.stands.filter(stand => {
        return stand.upgradeTime?.isAfter(moment().tz('Europe/Berlin')) ?? false;
      }) ?? []
    );
  }

  private hasBuildingEffect(buildingName: string, effectName: string): boolean {
    const building = this.stadium?.buildings?.find(b => b.name === buildingName && b.level > 0);
    return (
      building?.buildingLevels
        ?.find(bl => bl.idBuilding === building.id && bl.level === building.level)
        ?.buildingEffects?.some(be => be.name === effectName) ?? false
    );
  }

  private checkOngoingUpgrades() {
    if (this.stadium) {
      this.stadium.buildings.forEach(building => {
        // start the countdown for the upgrade time
        if (this.isBeingExpanded(building.upgradeTime)) {
          console.log(`Building ${building.name} is being expanded.`);
          this.stadiumService.startBuildingCountdown(building);
        } else if (building.upgradeTime && building.upgradeTime.isBefore(moment().tz('Europe/Berlin'))) {
          this.stadiumService.finishBuildingUpgrade(building);
        }
      });
      this.stadium.stands.forEach(stand => {
        // start the countdown for the upgrade time
        if (this.isBeingExpanded(stand.upgradeTime)) {
          console.log(`Stand ${stand.name} is being expanded.`);
          this.stadiumService.startStandCountdown(stand);
        } else if (stand.upgradeTime && stand.upgradeTime.isBefore(moment().tz('Europe/Berlin'))) {
          console.log(`Stand ${stand.name} upgrade time is in the past, finishing upgrade.`);
          this.stadiumService.finishStandUpgrade(stand);
        }
      });
    }
  }

  private showSuccess(msg: string, ms = 800) {
    this.snack.open(msg, '', {
      duration: ms, // 500–1200ms sind üblich; 500ms ist sehr knapp
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snack-success'],
    });
  }

  private showError(msg: string, ms = 2000) {
    this.snack.open(msg, '', {
      duration: ms,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snack-error'],
    });
  }

  private loadStandChangeListener() {
    this.saveStandPrice$
      .pipe(
        takeUntil(this.unsubscribe$),
        debounceTime(500),
        filter(() => !!this.selected()),
        filter(() => !this.busy()),
        filter(({ stand, price }) => price != null && price >= stand.minTicketPrice && price <= stand.maxTicketPrice),
        switchMap(({ stand, price }) => {
          this.savingStandPrice.set(true);
          return this.stadiumService.changeTicketPrice(stand, price).pipe(
            first(),
            tap(isChanged => {
              if (!isChanged) {
                this.showError('Ticketpreis konnte nicht gespeichert werden');
                return;
              }
              const standPosition = this.selectedStand();
              if (standPosition && standPosition === stand.position) {
                let selectedStand = this.getStandForPosition(standPosition);
                if (selectedStand) {
                  selectedStand.ticketPrice = price;
                  this.showSuccess('Ticketpreis gespeichert');
                }
                queueMicrotask(() => {
                  this.stadiumService.loadStadium();
                  this.teamService.updateTeam();
                });
              }
            }),
            catchError(() => {
              const standPosition = this.selectedStand();
              if (standPosition) {
                const selectedStand = this.getStandForPosition(standPosition);
                this.ticketPriceDraft.set(selectedStand ? selectedStand.ticketPrice : null);
              }
              this.showError('Speichern fehlgeschlagen');
              return EMPTY;
            }),
            finalize(() => this.savingStandPrice.set(false))
          );
        })
      )
      .subscribe();
  }

  private upgradeStandByPosition(standPosition: StandPosition, upgradedStand: Stand) {
    if (this.stadium) {
      this.stadium.stands = this.stadium.stands.map(stand => {
        if (stand.position === standPosition) {
          return upgradedStand;
        }
        return stand;
      });
    }
  }
}
