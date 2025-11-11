import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from './app/app-routing.module';
import { AuthServiceProvider } from 'src/app/services/auth';
import { PropiedadServiceProvider } from 'src/app/services/propiedad';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

(window as any).global = window;

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(IonicModule.forRoot(), AppRoutingModule, FormsModule),
    provideHttpClient(),
    AuthServiceProvider,
    PropiedadServiceProvider
  ]
});
