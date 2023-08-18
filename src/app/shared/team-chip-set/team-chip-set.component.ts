import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../team/services/team.service';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-team-chip-set',
  templateUrl: './team-chip-set.component.html',
  styleUrls: ['./team-chip-set.component.scss'],
})
export class TeamChipSetComponent implements OnInit {
  coins = 0;
  teamBudget = 0;
  salaryCap = 0;

  constructor(
    private auth: AuthStore,
    private teamService: TeamService
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.loadTeamIfPossible(user?.id);
    });
  }

  private loadTeamIfPossible(userId: number | undefined) {
    if (userId) {
      this.teamService.loadTeamForUser(userId).subscribe(team => {
        this.coins = team.credits;
        this.teamBudget = team.budget;
        this.salaryCap = team.salaryCap;
      });
    }
  }
}
