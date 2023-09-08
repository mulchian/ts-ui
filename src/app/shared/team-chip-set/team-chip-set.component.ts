import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../team/services/team.service';
import { AuthStore } from '../../services/auth.store';
import { Observable, of, takeUntil, takeWhile } from 'rxjs';
import { Team } from '../../model/team';

@Component({
  selector: 'app-team-chip-set',
  templateUrl: './team-chip-set.component.html',
  styleUrls: ['./team-chip-set.component.scss'],
})
export class TeamChipSetComponent implements OnInit {
  show$: Observable<boolean> = of(false);

  constructor(
    private readonly auth: AuthStore,
    private readonly teamService: TeamService
  ) {}

  ngOnInit() {
    this.show$ = this.auth.isLoggedIn$;
  }

  get team(): Observable<Team | null> {
    return this.teamService.team$;
  }
}
