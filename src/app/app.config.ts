import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, withRouterConfig } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { CustomPreloadingStrategy } from './core/services/custom-preloading.strategy';
import { popperVariation, provideTippyConfig, provideTippyLoader, tooltipVariation } from '@ngneat/helipopper/config';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      APP_ROUTES,
      withPreloading(CustomPreloadingStrategy),
      withRouterConfig({
        onSameUrlNavigation: 'reload',
        paramsInheritanceStrategy: 'always', // having paramMap of all parent routes
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
      })
    ),
    CustomPreloadingStrategy,
    { provide: LOCALE_ID, useValue: 'de-DE' },
    provideTippyLoader(() => import('tippy.js')),
    provideTippyConfig({
      defaultVariation: 'popper',
      variations: {
        tooltip: tooltipVariation,
        popper: popperVariation,
        popperBorder: {
          ...popperVariation,
          theme: 'light-border',
        },
        material: {
          ...popperVariation,
          theme: 'material',
          popperOptions: {
            modifiers: [
              {
                options: {
                  fallbackPlacements: ['bottom', 'right', 'top', 'left'],
                },
              },
            ],
          },
        },
      },
    }),
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
