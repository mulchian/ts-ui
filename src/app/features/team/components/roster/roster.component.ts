import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Player } from '../../../../core/model/player';
import { TeamService } from '../../../../core/services/team.service';
import { Router } from '@angular/router';
import { PlayerModalComponent } from '../../../../shared/modal/player-modal/player-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSortModule, Sort } from '@angular/material/sort';
import { SkillService } from '../../services/skill.service';
import { CommonModule } from '@angular/common';
import { TalentPipe } from '../../../../shared/pipe/talent.pipe';
import { MatProgressBar } from '@angular/material/progress-bar';
import { SaisonCountPipe } from '../../../../shared/pipe/saison-count.pipe';
import { MatButton, MatIconButton } from '@angular/material/button';
import { TippyDirective } from '@ngneat/helipopper';
import { ConfirmModalComponent } from '../../../../shared/modal/tooltip/confirm-modal/confirm-modal.component';
import { MatIcon } from '@angular/material/icon';
import { IntensityPipe } from '../../../../shared/pipe/intensity.pipe';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { TrainingGroup, TrainingService } from '../../services/training.service';
import { Subject, take, takeUntil } from 'rxjs';
import moment from 'moment-timezone';

@Component({
  selector: 'app-roster',
  templateUrl: './roster.component.html',
  styleUrls: ['./roster.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatProgressBar,
    MatSelectModule,
    MatButton,
    MatIcon,
    TippyDirective,
    TalentPipe,
    SaisonCountPipe,
    IntensityPipe,
    ConfirmModalComponent,
    MatIconButton,
  ],
  providers: [TeamService, SkillService, TrainingService],
})
export class RosterComponent implements OnInit, OnChanges, OnDestroy {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly teamService = inject(TeamService);
  private readonly skillService = inject(SkillService);
  private readonly trainingService = inject(TrainingService);

  sortedPositions: string[] = [
    'QB',
    'RB',
    'FB',
    'WR',
    'TE',
    'C',
    'OG',
    'OT',
    'DT',
    'DE',
    'MLB',
    'OLB',
    'CB',
    'FS',
    'SS',
    'K',
    'P',
  ];
  displayedColumns: string[] = ['position', 'ovr', 'age', 'name', 'talent'];
  players = new MatTableDataSource<Player>();
  skillNames: Record<string, string> = {};
  salaryCap = 0;
  @ViewChild(MatTable) playerTable: MatTable<Element> | undefined;
  destroy$ = new Subject<void>();

  @Input() showingPart: 'roster' | 'contracts' | 'training' = 'roster';
  @Input() needsReload: boolean = false;
  @Output() trainingGroupChanged = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {
    switch (this.router.url.split('/').pop()) {
      case 'roster':
        this.displayedColumns.push('energy', 'skillpoints', 'status');
        this.showingPart = 'roster';
        break;
      case 'contracts':
        this.displayedColumns.push('moral', 'salary', 'contract', 'action');
        this.showingPart = 'contracts';
        break;
      default:
        if (this.showingPart === 'training') {
          this.displayedColumns.push('energy', 'skillpoints', 'intensity', 'trainingCount', 'trainingGroup');
        }
        break;
    }

    // take players from team
    this.teamService.team$.pipe(takeUntil(this.destroy$)).subscribe(team => {
      if (team?.players) {
        this.salaryCap = team.salaryCap;
        this.players.data = Object.values(team.players);
        this.sortPlayers({ active: 'pos', direction: 'asc' });
        this.playerTable?.renderRows();
      }
    });
    this.skillService.skillNames$.pipe(takeUntil(this.destroy$)).subscribe(skillNames => {
      this.skillNames = skillNames || {};
    });
    this.trainingService.updateTrainingGroups();
  }

  ngOnChanges() {
    if (this.needsReload) {
      this.teamService
        .loadTeam()
        .pipe(take(1))
        .subscribe(team => {
          if (team?.players) {
            this.salaryCap = team.salaryCap;
            this.players.data = Object.values(team.players);
            this.sortPlayers({ active: 'pos', direction: 'asc' });
            this.playerTable?.renderRows();
          }
        });
      this.trainingService.updateTrainingGroups();
      this.needsReload = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get trainingGroups() {
    return this.trainingService.trainingGroups$;
  }

  openPlayerDialog(event: MouseEvent, player: Player) {
    let column = '';
    const target = event.target as HTMLElement;
    // search for clicked column with mouse event
    // first look for the actually clicked <td> or <mat-cell>
    const cell = target.closest('td, mat-cell');
    if (cell) {
      // with the clicked cell we look for the column name
      const rowElement = cell.parentElement;
      const cells = Array.from(rowElement?.children || []);
      const columnIndex = cells.indexOf(cell);
      column = this.displayedColumns[columnIndex];
      console.log('clicked column:', column);

      if (['action', 'intensity', 'trainingGroup'].includes(column)) {
        return;
      }
    }

    console.log('openPlayerDialog', player);
    let selectedTabIndex = 0;
    if (['salary', 'contract'].includes(column)) {
      selectedTabIndex = 3;
    }
    if (column === 'skillpoints') {
      selectedTabIndex = 2;
    }
    this.openDialog(player, selectedTabIndex);
  }

  openContractTab(player: Player) {
    this.openDialog(player, 3);
  }

  releasePlayer(player: Player) {
    // TODO: release player from team
    console.log('releasePlayer', player);
  }

  getFlooredSP(sp: number) {
    return Math.floor(sp);
  }

  calcSkillProgress(value: number) {
    return +(value - Math.floor(value)).toFixed(2) * 100 || 0;
  }

  sortPlayers(sort: Sort) {
    const data = this.players.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortPlayers({ active: 'pos', direction: 'asc' });
      return;
    }

    this.players.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'pos':
          return this.comparePosition(a, b, isAsc);
        case 'ovr':
          return this.compare(a.ovr, b.ovr, isAsc);
        case 'age':
          return a.age === b.age ? this.compare(a.ovr, b.ovr, false) : this.compare(a.age, b.age, isAsc);
        case 'name':
          return this.compare(a.firstName, b.firstName, isAsc);
        case 'talent':
          return a.talent === b.talent
            ? a.ovr === b.ovr
              ? this.compare(a.age, b.age, true)
              : this.compare(a.ovr, b.ovr, false)
            : this.compare(a.talent, b.talent, isAsc);
        case 'energy':
          return a.energy === b.energy ? this.compare(a.ovr, b.ovr, false) : this.compare(a.energy, b.energy, isAsc);
        case 'sp':
          return this.compare(a.skillpoints, b.skillpoints, isAsc);
        case 'status':
          return this.compare(a.status.description, b.status.description, isAsc);
        case 'moral':
          return this.compare(a.moral, b.moral, isAsc);
        case 'salary':
          return a.contract && b.contract ? this.compare(a.contract.salary, b.contract.salary, isAsc) : 0;
        case 'contract':
          return a.contract && b.contract ? this.compare(a.contract.endOfContract, b.contract.endOfContract, isAsc) : 0;
        case 'intensity':
          return this.compare(a.intensity, b.intensity, isAsc);
        case 'trainingCount':
          return this.compare(a.numberOfTrainings, b.numberOfTrainings, isAsc);
        default:
          return 0;
      }
    });
  }

  changeIntensity(player: Player) {
    const newIntensity = (player.intensity + 1) % 3 === 0 ? 3 : (player.intensity + 1) % 3;
    console.log('changeIntensity to', newIntensity);
    this.trainingService
      .changeIntensity(newIntensity, player.id)
      .pipe(take(1))
      .subscribe(res => {
        if (res.intensityChanged) {
          console.log('Intensity changed for player', player.firstName, player.lastName, 'to', newIntensity);
          player.intensity = newIntensity;
          this.trainingGroupChanged.emit(true);
        } else if (res.error) {
          console.error('Error changing intensity:', res.error);
        }
      });
  }

  updateTrainingGroup(event: MatSelectChange, player: Player) {
    console.log('updateTrainingGroup for player', player.firstName, player.lastName, 'to', event.value);
    this.trainingService
      .changeTrainingGroup(event.value, player.id)
      .pipe(take(1))
      .subscribe(res => {
        if (res.trainingGroupChanged) {
          console.log('Training group changed for player', player.firstName, player.lastName, 'to', event.value);
          player.trainingGroup = event.value;
          this.trainingService.updateTrainingGroups();
          this.trainingGroupChanged.emit(true);
        } else if (res.error) {
          console.error('Error changing training group:', res.error);
        }
      });
  }

  private openDialog(player: Player, selectedTabIndex: number) {
    this.dialog.open(PlayerModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      exitAnimationDuration: 0,
      minWidth: '50vw',
      maxHeight: '90vh',
      position: { top: '50px' },
      data: {
        selectedTabIndex,
        player,
        salaryCap: this.salaryCap,
        skillNames: this.skillNames,
      },
    });
  }

  private comparePosition(a: Player, b: Player, isAsc: boolean) {
    const aaKey = this.sortedPositions.indexOf(a.type.position.position);
    const bbKey = this.sortedPositions.indexOf(b.type.position.position);
    if (aaKey === bbKey) {
      if (a.ovr === b.ovr) {
        if (a.age === b.age) {
          return this.compare(a.talent, b.talent, true);
        }
        return this.compare(a.age, b.age, true);
      }
      return this.compare(a.ovr, b.ovr, false);
    }
    return aaKey - bbKey * (isAsc ? 1 : -1);
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  isTraining(trainingGroups: TrainingGroup[] | null, player: Player) {
    const playerTrainingGroup = trainingGroups?.find(tg => tg.id === player.trainingGroup);
    if (playerTrainingGroup) {
      if (playerTrainingGroup.trainingTimeToCount === null) {
        return false;
      }
      return playerTrainingGroup.trainingTimeToCount.isAfter(moment());
    }
    return false;
  }
}
