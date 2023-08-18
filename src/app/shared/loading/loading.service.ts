import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { concatMap, finalize, tap } from 'rxjs/operators';
import { DynamicOverlayService } from '../../services/dynamic-overlay.service';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private loadingInOverlaySubject = new BehaviorSubject<boolean>(false);
  loadingInOverlay$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private readonly overlayService: DynamicOverlayService) {
    console.log('Loading service created ...');
  }

  showLoaderUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
    return of(null).pipe(
      tap(() => this.loadingOn()),
      concatMap(() => obs$),
      finalize(() => this.loadingOff())
    );
  }

  loadingOn() {
    this.loadingSubject.next(true);
  }

  loadingOff() {
    this.loadingSubject.next(false);
  }

  loadingOnInOverlay(nativElement: HTMLElement) {
    this.overlayService.showOverlay(nativElement);
    this.loadingInOverlaySubject.next(true);
  }

  loadingOffInOverlay() {
    this.overlayService.hideOverlay();
    this.loadingInOverlaySubject.next(false);
  }
}
