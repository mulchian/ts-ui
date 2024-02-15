import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CustomPreloadingStrategy } from './services/custom-preloading.strategy';
import { authGuard, authGuardChild } from './services/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    data: {
      preload: true,
    },
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./features/user/user.module').then(m => m.UserModule),
  },
  {
    path: 'office',
    loadChildren: () =>
      import('./features/office/office.module').then(m => m.OfficeModule),
    canActivate: [authGuard],
    canActivateChild: [authGuardChild],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'finances',
    loadChildren: () =>
      import('./features/finance/finance.module').then(m => m.FinanceModule),
    canActivate: [authGuard],
    canActivateChild: [authGuardChild],
  },
  {
    path: 'team',
    loadChildren: () =>
      import('./features/team/team.module').then(m => m.TeamModule),
    canActivate: [authGuard],
    canActivateChild: [authGuardChild],
  },
  {
    path: 'league',
    loadChildren: () =>
      import('./features/team/team.module').then(m => m.TeamModule),
    canActivate: [authGuard],
    canActivateChild: [authGuardChild],
  },
  {
    path: '**',
    // component: PageNotFoundComponent
    redirectTo: '/home',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: CustomPreloadingStrategy,
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
      paramsInheritanceStrategy: 'always', // having paramMap of all parent routes
      // enableTracing: true,
    }),
  ],
  exports: [RouterModule],
  providers: [CustomPreloadingStrategy],
})
export class AppRoutingModule {}
