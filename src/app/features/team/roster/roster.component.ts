import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Player } from '../../../model/player';
import { TeamService } from '../services/team.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roster',
  templateUrl: './roster.component.html',
  styleUrls: ['./roster.component.scss'],
})
export class RosterComponent implements OnInit {
  displayedColumns: string[] = ['position', 'ovr', 'age', 'name', 'talent'];
  players = new MatTableDataSource<Player>();

  @ViewChild(MatTable)
  playerTable: MatTable<Element> | undefined;

  showRoster = true;

  constructor(
    private readonly router: Router,
    private readonly teamService: TeamService
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
      team?.players.forEach(player => {
        this.players.data.push(player);
      });
      this.playerTable?.renderRows();
    });
  }

  openPlayerDialog(player: Player) {
    // TODO: develop player dialog and open it
    console.log('openPlayerDialog: {}', player);
  }

  openContractTab(player: Player) {
    // TODO: open player dialog and switch into contract tab
    console.log('openPlayerDialog: {}', player);
  }

  releasePlayer(player: Player) {
    // TODO: release player from team
    console.log('releasePlayer: {}', player);
  }
}
