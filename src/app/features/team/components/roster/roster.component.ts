import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Player } from '../../../../core/model/player';
import { TeamService } from '../../../../core/services/team.service';
import { Router } from '@angular/router';
import { PlayerModalComponent } from '../../../../shared/modal/player-modal/player-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { SkillService } from '../../services/skill.service';

@Component({
  selector: 'app-roster',
  templateUrl: './roster.component.html',
  styleUrls: ['./roster.component.scss'],
})
export class RosterComponent implements OnInit {
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

  @ViewChild(MatTable)
  playerTable: MatTable<Element> | undefined;

  showRoster = true;

  constructor(
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly teamService: TeamService,
    private readonly skillService: SkillService
  ) {
    this.showRoster = this.router.url.endsWith('roster');
    if (this.showRoster) {
      this.displayedColumns.push('energy', 'skillpoints', 'status');
    } else {
      this.displayedColumns.push('moral', 'salary', 'contract', 'action');
    }
  }

  ngOnInit() {
    // take players from team
    this.teamService.team$.subscribe(team => {
      if (team?.players) {
        this.salaryCap = team.salaryCap;
        this.players.data = Object.values(team.players);
        this.sortPlayers({ active: 'pos', direction: 'asc' });
        this.playerTable?.renderRows();
      }
    });
    this.skillService.skillNames$.subscribe(skillNames => {
      this.skillNames = skillNames || {};
    });
  }

  openPlayerDialog(event: MouseEvent, player: Player) {
    let selectedTabIndex = 0;
    const column = (event.target as HTMLTableCellElement).cellIndex;
    if ((event.target as HTMLElement).className.includes('button')) {
      return;
    }
    console.log('openPlayerDialog', player);
    if (!this.showRoster && (column === 6 || column === 7)) {
      // column contract -> open contract tab
      selectedTabIndex = 3;
    }
    if (
      this.showRoster &&
      ((event.target as HTMLProgressElement).className.includes('progress') ||
        (event.target as HTMLElement).parentElement?.className.includes('progress'))
    ) {
      // open skill tab
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
        default:
          return 0;
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
}
