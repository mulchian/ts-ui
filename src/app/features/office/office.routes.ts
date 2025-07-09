import { Routes } from '@angular/router';
import { PersonalComponent } from './components/personal/personal.component';
import { OfficeComponent } from './office.component';
import { FriendlyComponent } from './components/friendly/friendly.component';

export const OFFICE_ROUTES: Routes = [
  {
    path: '',
    component: OfficeComponent,
  },
  {
    path: 'personal',
    component: PersonalComponent,
  },
  {
    path: 'friendly',
    component: FriendlyComponent,
  },
];
