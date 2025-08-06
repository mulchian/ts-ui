import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, first, Observable, shareReplay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import moment, { Moment } from 'moment-timezone';

@Injectable()
export class TrainingService {
  TRAINING_URL = '/api/training';
  private http = inject(HttpClient);
  private subject = new BehaviorSubject<TrainingGroup[] | null>(null);
  trainingGroups$: Observable<TrainingGroup[] | null> = this.subject.asObservable();

  loadTrainingGroups() {
    return this.http.get<TrainingGroup[]>(this.TRAINING_URL + '/getTrainingGroups.php').pipe(
      first(),
      tap(trainingGroups => {
        console.log('Training groups loaded:', trainingGroups);
        this.subject.next(trainingGroups);
      }),
      map(trainingGroups => {
        return trainingGroups.map(trainingGroup => {
          if (trainingGroup.trainingTimeToCount !== null) {
            trainingGroup.trainingTimeToCount = moment.tz(trainingGroup.trainingTimeToCount, 'Europe/Berlin');
          }
          return trainingGroup;
        });
      }),
      shareReplay()
    );
  }

  updateTrainingGroups() {
    this.loadTrainingGroups().subscribe(() => {
      console.log('Training groups updated');
    });
  }

  startTraining(trainingGroup: 'TE0' | 'TE1' | 'TE2' | 'TE3', trainingPart: 'fitness' | 'technique' | 'scrimmage') {
    return this.http.post<{ trainingStarted: boolean; error?: string }>(this.TRAINING_URL + '/startTraining.php', {
      trainingGroup: trainingGroup,
      trainingPart: trainingPart,
    });
  }

  changeIntensity(intensity: number, playerId: number | null = null) {
    return this.http.post<{ intensityChanged: boolean; error?: string }>(this.TRAINING_URL + '/changeIntensity.php', {
      intensity: intensity,
      playerId: playerId,
    });
  }

  changeTrainingGroup(newTrainingGroup: 'TE0' | 'TE1' | 'TE2' | 'TE3', playerId: number) {
    return this.http.post<{ trainingGroupChanged: boolean; error?: string }>(
      this.TRAINING_URL + '/changeTrainingGroup.php',
      {
        newTrainingGroup: newTrainingGroup,
        playerId: playerId,
      }
    );
  }

  changeTrainingGroupForAll(newTrainingGroup: 'TE0' | 'TE1' | 'TE2' | 'TE3') {
    return this.http.post<{ trainingGroupChanged: boolean; error?: string }>(
      this.TRAINING_URL + '/changeTrainingGroup.php',
      {
        newTrainingGroup: newTrainingGroup,
      }
    );
  }

  renameTrainingGroup(trainingGroup: 'TE0' | 'TE1' | 'TE2' | 'TE3', newName: string) {
    if ('TE0' === trainingGroup) {
      throw new Error('TE0 cannot be renamed');
    }
    return this.http.post<{ trainingGroupNameChanged: boolean; error?: string }>(
      this.TRAINING_URL + '/renameTrainingGroup.php',
      {
        trainingGroup: trainingGroup,
        newName: newName,
      }
    );
  }
}

export interface TrainingGroup {
  id: 'TE0' | 'TE1' | 'TE2' | 'TE3';
  name: string;
  trainingTimeToCount: Moment | null;
  tgPlayerIds: number[];
  intervalId: any | undefined;
  remainingTime: string | undefined;
}
