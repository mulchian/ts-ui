import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RosterComponent } from '../roster/roster.component';
import { TrainingGroup, TrainingService } from '../../services/training.service';
import { AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { TippyDirective } from '@ngneat/helipopper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TeamService } from '../../../../core/services/team.service';
import { LoadingService } from '../../../../shared/loading/loading.service';
import { InputModalComponent } from '../../../../shared/modal/tooltip/input-modal/input-modal.component';
import { TippyInstance } from '@ngneat/helipopper/config';
import { first, Observable, take } from 'rxjs';
import moment from 'moment-timezone';

@Component({
  selector: 'app-training.component',
  imports: [
    RosterComponent,
    AsyncPipe,
    TippyDirective,
    MatCardModule,
    MatIcon,
    MatFabButton,
    MatFormFieldModule,
    MatSelectModule,
    MatButton,
    MatIconButton,
    InputModalComponent,
  ],
  providers: [TeamService, TrainingService],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
})
export class TrainingComponent implements OnInit, OnDestroy {
  selectedTrainingGroup: 'TE0' | 'TE1' | 'TE2' | 'TE3' = 'TE1';
  needsReload = false;
  @ViewChild('tgChangeName')
  tgChangeName: TippyInstance | undefined;
  private readonly trainingService = inject(TrainingService);
  private readonly loadingService = inject(LoadingService);

  constructor() {}

  get trainingGroups(): Observable<TrainingGroup[] | null> {
    return this.trainingService.trainingGroups$;
  }

  ngOnInit() {
    this.reloadTrainingGroups();
  }

  ngOnDestroy() {
    this.trainingGroups.pipe(take(1)).subscribe(trainingGroups => {
      trainingGroups?.forEach(trainingGroup => {
        if (trainingGroup?.intervalId) {
          clearInterval(trainingGroup.intervalId);
        }
      });
    });
  }

  reloadTrainingGroups() {
    this.trainingService
      .loadTrainingGroups()
      .pipe(take(1))
      .subscribe(trainingGroups => {
        console.debug(trainingGroups);
        trainingGroups?.forEach(trainingGroup => {
          if (this.isTraining(trainingGroup)) {
            this.startCountdown(trainingGroup);
          } else {
            trainingGroup.remainingTime = '00:00';
          }
        });
      });
  }

  isTraining(trainingGroup: TrainingGroup): boolean {
    if (!trainingGroup.trainingTimeToCount) {
      return false;
    }
    return trainingGroup.trainingTimeToCount.isAfter(moment());
  }

  isTrainingForAll(groups: TrainingGroup[] | null) {
    return groups?.every(group => group.trainingTimeToCount?.isAfter(moment()));
  }

  startTraining(trainingGroup: TrainingGroup, trainingPart: 'fitness' | 'technique' | 'scrimmage') {
    this.loadingService.loadingOn();
    this.trainingService
      .startTraining(trainingGroup.id, trainingPart)
      .pipe(first())
      .subscribe(res => {
        if (res.trainingStarted) {
          console.log('Training started for', trainingGroup.name, 'with part', trainingPart);
          this.startCountdown(trainingGroup);
          this.reloadTrainingGroups();
          this.needsReload = true;
        } else if (res.error) {
          console.error('Error starting training:', res.error);
        }
        this.loadingService.loadingOff();
      });
  }

  renameTrainingGroup(newName: string, trainingGroup: TrainingGroup) {
    this.loadingService.loadingOn();
    this.trainingService
      .renameTrainingGroup(trainingGroup.id, newName)
      .pipe(first())
      .subscribe(res => {
        if (res.trainingGroupNameChanged) {
          console.log('Training group renamed to', newName);
          this.reloadTrainingGroups();
          this.tgChangeName?.hide();
        } else if (res.error) {
          console.error('Error renaming training group:', res.error);
        }
        this.loadingService.loadingOff();
      });
  }

  setTrainingGroupForAll() {
    this.needsReload = false;
    this.loadingService.loadingOn();
    this.trainingService
      .changeTrainingGroupForAll(this.selectedTrainingGroup)
      .pipe(first())
      .subscribe(res => {
        if (res.trainingGroupChanged) {
          console.log('Training group changed to', this.selectedTrainingGroup);
          this.reloadTrainingGroups();
          this.needsReload = true;
        } else if (res.error) {
          console.error('Error changing training group:', res.error);
        }
        this.loadingService.loadingOff();
      });
  }

  changeIntensity(intensity: number) {
    this.needsReload = false;
    this.loadingService.loadingOn();
    this.trainingService
      .changeIntensity(intensity)
      .pipe(first())
      .subscribe(res => {
        if (res.intensityChanged) {
          console.log('Training intensity changed to', intensity);
          this.reloadTrainingGroups();
          this.needsReload = true;
        } else if (res.error) {
          console.error('Error changing training intensity:', res.error);
        }
        this.loadingService.loadingOff();
      });
  }

  private startCountdown(trainingGroup: TrainingGroup) {
    this.updateRemainingTime(trainingGroup); // sofort beim Start

    trainingGroup.intervalId = setInterval(() => {
      this.updateRemainingTime(trainingGroup);
    }, 1000);
  }

  private updateRemainingTime(trainingGroup: TrainingGroup) {
    const secondsLeft = trainingGroup.trainingTimeToCount?.diff(moment(), 'seconds');

    if (secondsLeft === undefined || secondsLeft <= 0) {
      trainingGroup.remainingTime = '00:00';
      clearInterval(trainingGroup.intervalId);
      return;
    }

    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    if (hours > 0) {
      trainingGroup.remainingTime = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
      return;
    }
    trainingGroup.remainingTime = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}
