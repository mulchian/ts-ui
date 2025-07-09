import { map } from 'rxjs/operators';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from './auth.store';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  auth: AuthStore = inject(AuthStore),
  router: Router = inject(Router)
): Observable<boolean | UrlTree> => checkIfAuthenticated(auth, router);

export const authGuardChild: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  auth: AuthStore = inject(AuthStore),
  router: Router = inject(Router)
): Observable<boolean | UrlTree> => checkIfAuthenticated(auth, router);

function checkIfAuthenticated(auth: AuthStore, router: Router): Observable<boolean | UrlTree> {
  return auth.isLoggedIn$.pipe(map(loggedIn => (loggedIn ? true : router.parseUrl('/user/login'))));
}
