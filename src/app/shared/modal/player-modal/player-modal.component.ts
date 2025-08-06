import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../../core/services/team.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Player } from '../../../core/model/player';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { TalentPipe } from '../../pipe/talent.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { DraftPosition } from '../../../core/model/draftposition';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { SkillService } from '../../../features/team/services/skill.service';
import { first } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../../features/team/services/player.service';

@Component({
  selector: 'app-player-modal',
  templateUrl: './player-modal.component.html',
  styleUrls: ['./player-modal.component.scss'],
  imports: [
    CommonModule,
    MatTabsModule,
    MatGridListModule,
    TalentPipe,
    MatDividerModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatSliderModule,
    MatSelectModule,
    FormsModule,
  ],
  providers: [PlayerService, SkillService, TeamService],
})
export class PlayerModalComponent implements OnInit {
  dialogRef = inject<MatDialogRef<PlayerModalComponent>>(MatDialogRef);
  private readonly teamService = inject(TeamService);
  private readonly skillService = inject(SkillService);
  private readonly playerService = inject(PlayerService);

  currentTabIndex = 0;
  player: Player;
  skillNames: Record<string, string>;

  newSalary = 1;
  minSalary = 1;
  maxSalary = 1;
  salaryStep = 1;

  signingBonus = 0;
  moral = 1;
  overallOffer = 0;
  newSalaryCap = 0;
  timeOfContract = '3';
  salaryCap: number;

  @ViewChild(MatTabGroup)
  tabGroup: MatTabGroup | undefined;

  skillCards = signal<Skill[]>([]);

  constructor() {
    const data = inject<DialogData>(MAT_DIALOG_DATA);

    this.player = data.player;
    this.skillNames = data.skillNames;
    if (data.selectedTabIndex) {
      this.currentTabIndex = data.selectedTabIndex;
    }
    if (this.tabGroup) {
      this.tabGroup.selectedIndex = this.currentTabIndex;
    }

    this.salaryCap = data.salaryCap;
    this.initContractDetails();
    this.calcContractDetails();
  }

  ngOnInit() {
    if (this.tabGroup) {
      this.tabGroup.selectedIndex = this.currentTabIndex;
    }
    this.initSkillCards();
  }

  initSkillCards() {
    const cards: Skill[] = [];
    Object.keys(this.player.skills).forEach(key => {
      const value = this.player.skills[key] || 0;
      const progress = this.calcSkillProgress(value);
      cards.push({
        name: this.skillNames[key],
        value: Math.floor(value),
        progress: progress || 0,
      });
    });

    this.skillCards.set(cards);
  }

  getFlooredSP(sp: number) {
    return Math.floor(sp);
  }

  calcSkillProgress(value: number) {
    return Math.floor((value - Math.floor(value)) * 100);
  }

  updateSkill(skillName: string) {
    console.log('Update skill', skillName);
    this.skillService
      .updateSkill(this.getSkillNameKey(skillName), this.player.id)
      .pipe(first())
      .subscribe(data => {
        if (data.isUpdated) {
          this.teamService.updateTeam();
          this.skillCards.update(cards => {
            const card = cards.find(c => c.name === skillName);
            if (card) {
              card.value = Math.floor(card.value) + 1;
            }
            return cards;
          });
          this.player.skillpoints -= 1;
        } else if (data.error) {
          console.error('Error updating skill:', data.error);
        }
      });
  }

  signContract() {
    if (Math.random() < this.calcProbability()) {
      console.log('Vertrag wird erstellt.');
      // Chance zu Moral als Prozent, um hier zu sein.
      // Ist die Moral 0,75 ist die Chance 50 %, dass wir hier landen.
      this.playerService
        .negotiateContract(this.player, this.timeOfContract, this.newSalary)
        .pipe(first())
        .subscribe(data => {
          console.log('Vertrag erstellt:', data.isNegotiated);
          if (data.isNegotiated) {
            this.teamService.updateTeam();
          } else if (data.error) {
            console.error('Error negotiating contract:', data.error);
          }
        });
    } else {
      console.log('Chance verpasst');
      this.updateSalaryRange();
    }
  }

  calcProbability(): number {
    let probability = 0.5;
    if (this.moral <= 0.8) {
      probability += this.moral - 0.75;
    } else if (this.moral < 0.9) {
      probability += 0.05 + (((this.moral * 100) % 10) * 2) / 100;
    } else if (this.moral < 0.98) {
      probability += 0.26 + (((this.moral * 100) % 10) * 3) / 100;
    } else {
      probability = this.moral;
    }
    return probability;
  }

  changeSalary() {
    this.calcContractDetails();
  }

  onSalaryTimeChange() {
    this.calcContractDetails();
  }

  formatSalary(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  getDraftPosition(draftPosition: DraftPosition) {
    let draftPosString = `${draftPosition.season}. Season`;
    if (draftPosition.round && draftPosition.pick) {
      draftPosString += ` | ${draftPosition.round}. Round | ${draftPosition.pick}. Pick`;
    }
    return draftPosString;
  }

  private initContractDetails() {
    this.maxSalary = Math.floor((this.player.marketValue * 20) / 100);
    const minContractMoral = this.player.minContractMoral || 0.75;
    this.minSalary = Math.floor(this.maxSalary * minContractMoral);
    this.salaryStep = Math.floor(this.maxSalary * 0.01);
    this.newSalary = this.player.contract?.salary || this.minSalary;
  }

  private calcContractDetails() {
    this.moral = Math.round((this.newSalary / this.maxSalary) * 100) / 100;
    if (this.moral < this.player.minContractMoral) {
      this.moral = this.player.minContractMoral;
    }
    this.signingBonus = Math.floor(this.player.marketValue * (0.05 * +this.timeOfContract)) * +this.timeOfContract;
    this.overallOffer = this.newSalary + this.signingBonus;
    this.newSalaryCap = this.salaryCap - this.overallOffer;
  }

  private updateSalaryRange() {
    const changedMoral = this.moral + 0.05;
    this.minSalary = Math.floor(this.maxSalary * changedMoral);
    if (this.newSalary < this.minSalary) {
      this.moral = this.minSalary / (this.newSalary / changedMoral);
      this.newSalary = this.minSalary;
    }
    if (this.minSalary > this.maxSalary) {
      this.minSalary = this.maxSalary;
    }
    this.playerService
      .updateMinContractMoral(this.player.id, changedMoral)
      .pipe(first())
      .subscribe(res => {
        if (res.isUpdated) {
          this.teamService.updateTeam();
          this.player.minContractMoral = changedMoral;
        } else if (res.error) {
          console.error('Error updating minimum contract moral:', res.error);
        }
      });
    this.calcContractDetails();
  }

  private getSkillNameKey(skillName: string): string {
    return Object.keys(this.skillNames).find(key => this.skillNames[key] === skillName) || skillName;
  }
}

export interface DialogData {
  selectedTabIndex: number | null;
  player: Player;
  salaryCap: number;
  skillNames: Record<string, string>;
}

export interface Skill {
  name: string;
  value: number;
  progress: number;
}
