import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-AR';
import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { caseConverterInterceptor } from './core/interceptors/case-converter.interceptor';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
        provideZoneChangeDetection({ eventCoalescing: true }), 
        provideRouter(routes),
        providePrimeNG(),
        provideAnimationsAsync(),
        provideHttpClient(withInterceptors([authInterceptor, caseConverterInterceptor])),
        { provide: LOCALE_ID, useValue: 'es-AR' }
    ]
};
