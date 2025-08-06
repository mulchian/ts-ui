import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Team } from 'src/app/core/model/team';
import { TeamService } from '../../../../core/services/team.service';
import { Subject, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatSortModule } from '@angular/material/sort';
import { Stadium } from '../../../../core/model/stadium';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { LoadingService } from '../../../../shared/loading/loading.service';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-infrastructure.component',
  templateUrl: './infrastructure.component.html',
  styleUrl: './infrastructure.component.scss',
  imports: [CommonModule, MatTableModule, MatSortModule, MatCardModule, MatDividerModule, MatIconModule, MatIconButton],
  providers: [TeamService],
})
export class InfrastructureComponent implements OnInit, OnDestroy {
  team: Team | undefined;
  stadium: Stadium | undefined;
  unsubscribe$ = new Subject<void>();
  private readonly loadingService = inject(LoadingService);
  private readonly teamService = inject(TeamService);

  constructor() {
    this.loadingService.loadingOn();
  }

  ngOnInit(): void {
    this.teamService.team$.pipe(takeUntil(this.unsubscribe$)).subscribe(team => {
      if (team) {
        this.team = team;
        this.stadium = team.stadium;
        this.loadingService.loadingOff();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
