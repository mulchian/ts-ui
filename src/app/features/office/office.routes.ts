import { Routes } from '@angular/router';
import { PersonalComponent } from './components/personal/personal.component';
import { OfficeComponent } from './office.component';
import { FriendlyComponent } from './components/friendly/friendly.component';
import { InfrastructureComponent } from './components/infrastructure/infrastructure.component';
import { FinanceComponent } from './components/finance/finance.component';

export const OFFICE_ROUTES: Routes = [
  {
    path: '',
    component: OfficeComponent,
  },
  {
    path: 'finances',
    component: FinanceComponent,
  },
  {
    path: 'personal',
    component: PersonalComponent,
  },
  {
    path: 'friendly',
    component: FriendlyComponent,
  },
  {
    path: 'infrastructure',
    component: InfrastructureComponent,
  },
];
