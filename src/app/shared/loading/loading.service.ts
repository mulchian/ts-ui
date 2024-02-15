import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { concatMap, finalize, tap } from 'rxjs/operators';
import { DynamicOverlayService } from '../../services/dynamic-overlay.service';
import { OverlayRef } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private loadingInOverlaySubject = new BehaviorSubject<boolean>(false);
  loadingInOverlay$: Observable<boolean> = this.loadingSubject.asObservable();

  loadingRoute = false;

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

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  loadingOn() {
    this.loadingSubject.next(true);
  }

  loadingOff() {
    this.loadingSubject.next(false);
  }

  loadingOnRouting() {
    if (!this.loadingSubject.value && this.loadingRoute) {
      this.loadingSubject.next(true);
    }
  }

  loadingOffRouting() {
    if (this.loadingRoute) {
      this.loadingSubject.next(false);
    }
  }

  loadingOnInOverlay(nativElement: HTMLElement) {
    const overlayRef = this.overlayService.showOverlay(nativElement);
    this.loadingInOverlaySubject.next(true);
    return overlayRef;
  }

  loadingOffInOverlayForAll() {
    this.overlayService.hideAllOverlays();
    this.loadingInOverlaySubject.next(false);
  }

  loadingOffInOverlay(overlayRef: OverlayRef) {
    this.overlayService.hideOverlay(overlayRef);
    this.loadingInOverlaySubject.next(false);
  }
}
