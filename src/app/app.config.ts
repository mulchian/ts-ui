import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, withRouterConfig } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { CustomPreloadingStrategy } from './core/services/custom-preloading.strategy';
import { popperVariation, provideTippyConfig, provideTippyLoader, tooltipVariation } from '@ngneat/helipopper/config';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';

const DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
    timeInput: 'HH:mm',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
    timeInput: 'HH:mm',
    timeOptionLabel: 'HH:mm',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
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
    provideMomentDateAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
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
        tooltipBorder: {
          ...tooltipVariation,
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
