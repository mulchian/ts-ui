import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { League } from '../../../../core/model/league';
import { Subject, takeUntil } from 'rxjs';
import { LeagueService } from '../../services/league.service';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { LeagueStandings, Standing } from '../../../../core/model/standing';
import { StandingsTableComponent } from './standings-table/standings-table.component';
import { TeamService } from '../../../../core/services/team.service';
import { Team } from '../../../../core/model/team';

type Conference = 'North' | 'South';
type Division = 'North' | 'South' | 'East' | 'West';
function isConference(value: string): value is Conference {
  return value === 'North' || value === 'South';
}
function isDivision(value: string): value is Division {
  return ['North', 'South', 'East', 'West'].includes(value);
}

@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrl: './standings.component.scss',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    StandingsTableComponent,
  ],
  providers: [TeamService, LeagueService],
})
export class StandingsComponent implements OnInit {
  conferences: Conference[] | null = null;
  divisions: Division[] | null = null;
  viewMode: 'Conference' | 'Division' = 'Conference';
  selectedConference: Conference | null = null;

  team: Team | null = null;

  selectedLeague: League | null = null;
  leagues: League[] = [];

  leagueStandings: LeagueStandings[] | null = null;
  selectedStandings: Standing[] | null = null;

  unsubscribe$ = new Subject<void>();
  private readonly leagueService = inject(LeagueService);
  private readonly teamService = inject(TeamService);

  ngOnInit() {
    this.teamService.team$.pipe(takeUntil(this.unsubscribe$)).subscribe(team => {
      this.team = team;
      if (team && !this.selectedLeague) {
        this.selectedLeague = team.league;
      }
    });
    this.leagueService.standings$.pipe(takeUntil(this.unsubscribe$)).subscribe(leagueStandings => {
      if (leagueStandings) {
        this.leagueStandings = leagueStandings;

        let filteredLeagues = leagueStandings.map(leagueStanding => {
          return leagueStanding.league;
        });
        this.leagues = filteredLeagues.reduce((accumulator: League[], currentItem) => {
          const isDuplicate = accumulator.some(
            item =>
              item.id === currentItem.id &&
              item.leagueNumber === currentItem.leagueNumber &&
              item.country === currentItem.country
          );

          if (!isDuplicate) {
            accumulator.push({ ...currentItem });
          }
          return accumulator;
        }, []);
      }
      if (!this.selectedLeague) {
        if (this.team) {
          this.selectedLeague = this.team.league;
        } else {
          this.selectedLeague = this.leagues[0];
        }
      }
      this.selectedStandings = leagueStandings?.find(ls => ls.league.id === this.selectedLeague?.id)?.standings ?? [];

      this.conferences = this.getConferences();
      this.divisions = this.getDivisions();
    });
  }

  onViewModeChanged(event: MatButtonToggleChange) {
    this.viewMode = event.value;
    if (this.viewMode === 'Division' && this.conferences) {
      if (this.team) {
        this.selectedConference = this.team.conference.description.split(' ')[1] as Conference;
      } else {
        this.selectedConference = this.conferences[0];
      }
    }
  }

  onLeagueChanged(event: MatSelectChange) {
    this.selectedLeague = event.value;
    this.selectedStandings =
      this.leagueStandings?.find(ls => ls.league.id === this.selectedLeague?.id)?.standings ?? [];
  }

  onConferenceChanged(event: MatSelectChange) {
    this.selectedConference = event.value;
  }

  getConferences() {
    return Array.from(new Set((this.selectedStandings ?? []).map(r => r.conference.split(' ')[1])))
      .filter(isConference)
      .sort();
  }

  getDivisions() {
    return Array.from(new Set((this.selectedStandings ?? []).map(r => r.division.split(' ')[1])))
      .filter(isDivision)
      .sort();
  }

  getStandingsByConference(standings: Standing[], conference: Conference) {
    return standings.filter(r => r.conference.endsWith(conference));
  }
  getStandingsByDivision(standings: Standing[], division: Division) {
    return standings.filter(
      r => r.conference.endsWith(this.selectedConference ?? 'North') && r.division.endsWith(division)
    );
  }
}
