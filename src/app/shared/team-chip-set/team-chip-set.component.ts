import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../core/services/team.service';
import { AuthStore } from '../../core/services/auth.store';
import { Observable, of } from 'rxjs';
import { Team } from '../../core/model/team';

@Component({
  selector: 'app-team-chip-set',
  templateUrl: './team-chip-set.component.html',
  styleUrls: ['./team-chip-set.component.scss'],
  standalone: false,
})
export class TeamChipSetComponent implements OnInit {
  show$: Observable<boolean> = of(false);

  constructor(
    private readonly auth: AuthStore,
    private readonly teamService: TeamService
  ) {}

  get team(): Observable<Team | null> {
    return this.teamService.team$;
  }

  ngOnInit() {
    this.show$ = this.auth.isLoggedIn$;
  }
}
