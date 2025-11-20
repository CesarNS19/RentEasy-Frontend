import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { RouteReuseStrategy } from '@angular/router';
import { AppRoutingModule } from './app/app-routing.module';
import { AuthServiceProvider } from 'src/app/services/auth';
import { PropiedadServiceProvider } from 'src/app/services/propiedad';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { firebaseConfig } from './environments/firebase-config';

(window as any).global = window;

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideMessaging(() => getMessaging()),
    importProvidersFrom(
      IonicModule.forRoot(),
      AppRoutingModule,
      FormsModule,
    ),

    provideHttpClient(),
    AuthServiceProvider,
    PropiedadServiceProvider,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ]
});
