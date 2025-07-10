import { Routes } from '@angular/router';
import { authGuard, authGuardChild } from './core/services/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.routes').then(m => m.HOME_ROUTES),
    data: {
      preload: true,
    },
  },
  {
    path: 'user',
    loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES),
  },
  {
    path: 'office',
    loadChildren: () => import('./features/office/office.routes').then(m => m.OFFICE_ROUTES),
    canActivate: [authGuard],
    canActivateChild: [authGuardChild],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'finances',
    loadChildren: () => import('./features/finance/finance.routes').then(m => m.FINANCE_ROUTES),
    canActivate: [authGuard],
    canActivateChild: [authGuardChild],
  },
  {
    path: 'team',
    loadChildren: () => import('./features/team/team.routes').then(m => m.TEAM_ROUTES),
    canActivate: [authGuard],
    canActivateChild: [authGuardChild],
  },
  // {
  // path: 'league',
  // loadChildren: () => import('./features/league/league.routes').then(m => m.LEAGUE_ROUTES),
  // canActivate: [authGuard],
  // canActivateChild: [authGuardChild],
  // },
  {
    path: '**',
    // component: PageNotFoundComponent
    redirectTo: '/home',
  },
];
