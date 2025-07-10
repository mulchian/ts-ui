import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
registerLocaleData(localeDe, 'de-DE', localeDeExtra);
