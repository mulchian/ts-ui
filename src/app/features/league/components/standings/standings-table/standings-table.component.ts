import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { Standing } from '../../../../../core/model/standing';
import { MatSortModule, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-standings-table',
  imports: [CommonModule, MatTableModule, MatIcon, MatSortModule],
  templateUrl: './standings-table.component.html',
  styleUrl: './standings-table.component.scss',
})
export class StandingsTableComponent implements OnInit {
  @Input() title: string = '';
  @Input() standings: Standing[] = [];
  @Input() isConferenceMode: boolean = true;

  standingsTable = new MatTableDataSource<Standing>();
  displayedColumns = ['rank', 'trend', 'team', 'ovr', 'record', 'rate', 'points', 'dif'];

  ngOnInit() {
    this.standingsTable.data = this.standings;
  }

  trendDelta(r: Standing) {
    if (this.isConferenceMode) {
      return r.prevRankConf ? r.prevRankConf - r.rankConf : 0;
    } else {
      return r.prevRankDiv ? r.prevRankDiv - r.rankDiv : 0;
    }
  }
  trendIcon(r: Standing) {
    const d = this.trendDelta(r);
    return d > 0 ? 'north' : d < 0 ? 'south' : 'remove';
  } // mat-icon names
  trendClass(r: Standing) {
    const d = this.trendDelta(r);
    return d > 0 ? 'text-green-600' : d < 0 ? 'text-red-600' : 'text-slate-400';
  }
  rate(r: Standing) {
    const g = r.wins + r.losses + r.ties;
    return g ? (r.wins + r.ties * 0.5) / g : 0;
  }
  dif(r: Standing) {
    return r.ptsFor - r.ptsAgainst;
  }

  sortStandings(sort: Sort) {
    const data = this.standingsTable.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortStandings({ active: 'pos', direction: 'asc' });
      return;
    }

    this.standingsTable.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'rank':
          if (this.isConferenceMode) {
            return this.compare(a.rankConf, b.rankConf, isAsc);
          } else {
            return this.compare(a.rankDiv, b.rankDiv, isAsc);
          }
        case 'team':
          return this.compare(a.teamName, b.teamName, isAsc);
        case 'ovr':
          return this.compare(a.ovr, b.ovr, isAsc);
        case 'record':
          return this.compare(a.wins - a.losses, b.wins - b.losses, isAsc);
        case 'rate':
          return this.compare(this.rate(a), this.rate(b), isAsc);
        case 'points':
          return this.compare(a.ptsFor, b.ptsFor, isAsc);
        case 'dif':
          return this.compare(this.dif(a), this.dif(b), isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
