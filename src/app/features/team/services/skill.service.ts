import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, first, Observable } from 'rxjs';

@Injectable()
export class SkillService {
  private http = inject(HttpClient);

  private subject = new BehaviorSubject<Record<string, string> | null>(null);
  skillNames$: Observable<Record<string, string> | null> = this.subject.asObservable();

  constructor() {
    this.loadSkillNames();
  }

  updateSkill(skillName: string, playerId: number) {
    return this.http.post<{ isUpdated: boolean; error?: string }>('/api/player' + '/updateSkill.php', {
      skillName,
      playerId,
    });
  }

  private loadSkillNames() {
    this.http
      .get<Record<string, string>>('/api/player' + '/getSkillNames.php')
      .pipe(first())
      .subscribe(skillNames => {
        this.subject.next(skillNames);
      });
  }
}
