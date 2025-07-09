import { Component, inject, OnInit } from '@angular/core';
import { TeamService } from '../../core/services/team.service';
import { AuthStore } from '../../core/services/auth.store';
import { Observable, of } from 'rxjs';
import { Team } from '../../core/model/team';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-team-chip-set',
  templateUrl: './team-chip-set.component.html',
  styleUrls: ['./team-chip-set.component.scss'],
  imports: [CommonModule, MatChipsModule],
  providers: [TeamService],
})
export class TeamChipSetComponent implements OnInit {
  private readonly auth = inject(AuthStore);
  private readonly teamService = inject(TeamService);

  show$: Observable<boolean> = of(false);

  get team$(): Observable<Team | null> {
    return this.teamService.team$;
  }

  ngOnInit() {
    this.show$ = this.auth.isLoggedIn$;
  }
}
