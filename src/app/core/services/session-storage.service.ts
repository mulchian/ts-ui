import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  constructor() {}

  setSelectedCoachingTeamPart(teamPart: 'general' | 'offense' | 'defense') {
    console.log('Saving selected coaching team part in session storage', teamPart);
    sessionStorage.setItem('selectedCoachingTeamPart', teamPart);
  }

  getSelectedCoachingTeamPart(): 'general' | 'offense' | 'defense' {
    const storedTeamPart = sessionStorage.getItem('selectedCoachingTeamPart');
    console.log('Getting selected coaching from session storage', storedTeamPart);
    if (storedTeamPart && ['general', 'offense', 'defense'].includes(storedTeamPart)) {
      return storedTeamPart as 'general' | 'offense' | 'defense';
    }
    return 'offense';
  }
}
