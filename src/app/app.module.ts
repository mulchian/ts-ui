import '@angular/common/locales/global/de';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { SharedModule } from './shared/shared.module';
import { TeamService } from './core/services/team.service';
import { StadiumService } from './core/services/stadium.service';
import { popperVariation, provideTippyConfig, tooltipVariation } from '@ngneat/helipopper/config';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    MatTooltipModule,
    MatChipsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
  ],
  providers: [
    TeamService,
    StadiumService,
    { provide: LOCALE_ID, useValue: 'de' },
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
})
export class AppModule {}
