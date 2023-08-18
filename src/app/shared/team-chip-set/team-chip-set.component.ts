import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../team/services/team.service';
import { AuthStore } from '../../services/auth.store';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-team-chip-set',
  templateUrl: './team-chip-set.component.html',
  styleUrls: ['./team-chip-set.component.scss'],
})
export class TeamChipSetComponent implements OnInit {
  coins = 0;
  teamBudget = 0;
  salaryCap = 0;

  show$: Observable<boolean> = of(false);

  constructor(
    private readonly auth: AuthStore,
    private readonly teamService: TeamService
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe(() => {
      this.loadTeamIfPossible();
    });
    this.show$ = this.auth.isLoggedIn$;
  }

  private loadTeamIfPossible() {
    this.teamService.loadTeam().subscribe(team => {
      this.coins = team.credits;
      this.teamBudget = team.budget;
      this.salaryCap = team.salaryCap;
    });
  }
}
