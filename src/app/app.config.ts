import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DialogModule, DEFAULT_DIALOG_CONFIG, DialogConfig } from '@angular/cdk/dialog';
import { authInterceptor } from './auth/auth.interceptor';
import { provideToastr } from 'ngx-toastr';

const defaultDialogConfig: Partial<DialogConfig> = {
  hasBackdrop: true,
  autoFocus: 'first-tabbable',
  panelClass: 'app-dialog-panel',
  backdropClass: 'app-dialog-backdrop',
  maxWidth: '96vw',
  maxHeight: '90vh'
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideToastr({
      maxOpened: 5,
      autoDismiss: true,
      newestOnTop: true,
      preventDuplicates: true,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true
    }),
    importProvidersFrom(DialogModule),
    { provide: DEFAULT_DIALOG_CONFIG, useValue: defaultDialogConfig }
  ]
};
