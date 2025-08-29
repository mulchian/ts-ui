import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { TeamService } from '../../../../core/services/team.service';
import { first, Observable, Subject, takeUntil } from 'rxjs';
import { Team } from '../../../../core/model/team';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { map, tap } from 'rxjs/operators';
import moment, { Moment } from 'moment-timezone';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { TippyDirective } from '@ngneat/helipopper';
import { ConfirmModalComponent } from '../../../../shared/modal/tooltip/confirm-modal/confirm-modal.component';
import { GameEvent } from '../../../../core/model/game-event';
import { EventService } from '../../services/event.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-friendly',
  templateUrl: './friendly.component.html',
  styleUrls: ['./friendly.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatTableModule,
    MatSortModule,
    TippyDirective,
    ConfirmModalComponent,
    RouterLink,
  ],
  providers: [TeamService, EventService],
})
export class FriendlyComponent implements OnInit, OnDestroy {
  activeTeams$: Observable<Team[]> | undefined;
  displayedColumns: string[] = ['gametime', 'home', 'away', 'accepted', 'actions'];
  allFriendlies = new MatTableDataSource<GameEvent>();
  @ViewChild(MatTable) friendlyTable: MatTable<Element> | undefined;
  @ViewChild('opponentSelect') opponentSelect: MatSelect | undefined;
  team: Team | undefined;
  gameLocation: 'home' | 'away' = 'home';
  gameTime: Moment;
  minTime: Moment;
  unsubscribe$ = new Subject<void>();
  protected readonly moment = moment;
  private readonly teamService = inject(TeamService);
  private readonly eventService = inject(EventService);

  constructor() {
    this.gameTime = moment().add(2, 'hours').startOf('h');
    this.minTime = moment().add(2, 'hours').startOf('h');
  }

  ngOnInit() {
    this.teamService.team$.pipe(takeUntil(this.unsubscribe$)).subscribe(selfTeam => {
      if (selfTeam) {
        this.team = selfTeam;
        this.activeTeams$ = this.teamService.loadActiveTeams().pipe(
          first(),
          tap(teams => {
            console.log('Active teams loaded', teams);
          }),
          map(teams => {
            return teams.filter(team => team.id !== selfTeam.id);
          })
        );
        this.loadAllFriendlies();
      }
    });
  }

  ngOnDestroy() {
    console.log('FriendlyComponent destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addFriendly() {
    const friendly: GameEvent = {
      id: '',
      gameTime: this.gameTime,
      gameday: null,
      home: this.gameLocation === 'home' ? this.team?.name : this.opponentSelect?.value,
      away: this.gameLocation === 'away' ? this.team?.name : this.opponentSelect?.value,
      homeAccepted: this.gameLocation === 'home',
      awayAccepted: this.gameLocation === 'away',
      result: null,
    };

    this.eventService
      .addFriendly(friendly)
      .pipe(first())
      .subscribe(res => {
        if (res.added) {
          console.log('Friendly added successfully');
          if (res.friendly) {
            this.allFriendlies.data.push(res.friendly);
            this.sortFriendlies({ active: 'gametime', direction: 'asc' });
            this.friendlyTable?.renderRows();
          } else {
            this.loadAllFriendlies();
          }
        } else {
          console.error('Failed to add friendly:', res.error);
        }
      });
  }

  acceptFriendly(friendly: GameEvent) {
    friendly.homeAccepted = friendly.homeAccepted ? friendly.homeAccepted : friendly.home === this.team?.name;
    friendly.awayAccepted = friendly.awayAccepted ? friendly.awayAccepted : friendly.away === this.team?.name;
    this.eventService
      .acceptFriendly(friendly)
      .pipe(first())
      .subscribe(res => {
        if (res.accepted) {
          friendly.homeAccepted;
        }
      });
  }

  declineFriendly(friendly: GameEvent) {
    this.eventService
      .declineFriendly(friendly)
      .pipe(first())
      .subscribe(res => {
        if (res.declined) {
          this.allFriendlies.data = this.allFriendlies.data.filter(f => f.id !== friendly.id);
          this.friendlyTable?.renderRows();
          console.log('Decline successful');
        } else {
          console.error('Decline failed:', res.error);
        }
      });
  }

  isLive(friendly: GameEvent) {
    return this.eventService.isLive(friendly);
  }

  getAcceptedCount(friendly: any) {
    let acceptedCount = 0;
    if (friendly.homeAccepted) acceptedCount++;
    if (friendly.awayAccepted) acceptedCount++;
    return acceptedCount + '/2';
  }

  isCancelable(friendly: GameEvent) {
    return this.eventService.isCancelable(friendly, this.team?.name ?? '');
  }

  isAcceptableOrDeclinable(friendly: GameEvent) {
    return this.eventService.isAcceptableOrDeclinable(friendly, this.team?.name ?? '');
  }

  sortFriendlies(sort: Sort) {
    const data = this.allFriendlies.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortFriendlies({ active: 'gametime', direction: 'asc' });
      return;
    }

    this.allFriendlies.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'gametime':
          return isAsc ? a.gameTime.diff(b.gameTime) : b.gameTime.diff(a.gameTime);
        case 'home':
          return this.compare(a.home, b.home, isAsc);
        case 'away':
          return this.compare(a.away, b.away, isAsc);
        case 'accepted':
          const aAccepted = (a.homeAccepted ? 1 : 0) + (a.awayAccepted ? 1 : 0);
          const bAccepted = (b.homeAccepted ? 1 : 0) + (b.awayAccepted ? 1 : 0);
          return this.compare(aAccepted, bAccepted, isAsc);
        default:
          return 0;
      }
    });
  }

  private loadAllFriendlies() {
    this.eventService
      .loadAllFriendlies()
      .pipe(first())
      .subscribe(friendlies => {
        Promise.resolve().then(() => {
          queueMicrotask(() => {
            const friendliesToDelete = this.eventService.filterAndDeleteOldFriendlies(
              friendlies,
              this.team?.name ?? ''
            );
            this.allFriendlies.data = this.allFriendlies.data.filter(
              friendly => !friendliesToDelete.includes(friendly)
            );
            this.friendlyTable?.renderRows();
          });
        });
        this.allFriendlies.data = friendlies;
        this.sortFriendlies({ active: 'gametime', direction: 'asc' });
        this.friendlyTable?.renderRows();
      });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
