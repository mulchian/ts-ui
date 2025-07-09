import { Directionality } from '@angular/cdk/bidi';
import {
  Overlay,
  OverlayKeyboardDispatcher,
  OverlayOutsideClickDispatcher,
  OverlayPositionBuilder,
  OverlayRef,
  ScrollStrategyOptions,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT, Location } from '@angular/common';
import {
  ComponentFactoryResolver,
  Inject,
  Injectable,
  Injector,
  NgZone,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { DynamicOverlayContainerService } from './dynamic-overlay-container.service';
import { OverlayLoadingComponent } from '../../shared/loading/overlay-loading/overlay-loading.component';

@Injectable({
  providedIn: 'root',
})
export class DynamicOverlayService extends Overlay {
  private readonly _dynamicOverlayContainer: DynamicOverlayContainerService;
  private readonly renderer: Renderer2;
  private overlayRefs: OverlayRef[] = [];

  constructor(
    scrollStrategies: ScrollStrategyOptions,
    _overlayContainer: DynamicOverlayContainerService,
    _componentFactoryResolver: ComponentFactoryResolver,
    _positionBuilder: OverlayPositionBuilder,
    _keyboardDispatcher: OverlayKeyboardDispatcher,
    _injector: Injector,
    _ngZone: NgZone,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(DOCUMENT) _document: any,
    _directionality: Directionality,
    rendererFactory: RendererFactory2,
    _location: Location,
    _outsideClickDispatcher: OverlayOutsideClickDispatcher
  ) {
    super(
      scrollStrategies,
      _overlayContainer,
      _componentFactoryResolver,
      _positionBuilder,
      _keyboardDispatcher,
      _injector,
      _ngZone,
      _document,
      _directionality,
      _location,
      _outsideClickDispatcher
    );
    this.renderer = rendererFactory.createRenderer(null, null);

    this._dynamicOverlayContainer = _overlayContainer;
  }

  createWithDefaultConfig(containerElement: HTMLElement): OverlayRef {
    this.setContainerElement(containerElement);
    return super.create({
      positionStrategy: this.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true,
    });
  }

  showOverlay(nativeElement: HTMLElement): OverlayRef {
    const overlayRef = this.createWithDefaultConfig(nativeElement);
    overlayRef.attach(new ComponentPortal(OverlayLoadingComponent));
    this.overlayRefs.push(overlayRef);
    return overlayRef;
  }

  hideOverlay(overlayRef: OverlayRef) {
    overlayRef.detach();
  }

  hideAllOverlays() {
    this.overlayRefs.forEach(overlayRef => overlayRef.detach());
  }

  private setContainerElement(containerElement: HTMLElement): void {
    this.renderer.setStyle(containerElement, 'transform', 'translateZ(0)');
    this._dynamicOverlayContainer.setContainerElement(containerElement);
  }
}
