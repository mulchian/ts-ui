import { PreloadingStrategy, Route } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(
    route: Route,
    load: () => Observable<never>
  ): Observable<never | null> {
    if (route.data?.['preload']) {
      return load();
    }
    return of(null);
  }
}
