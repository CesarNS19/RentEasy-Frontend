import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { PropiedadFormPage } from './pages/propiedad-form/propiedad-form.page';
import { LoginPage } from './pages/login/login.page';
import { HomePage } from './pages/home/home.page';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  {
    path: 'registro',
    loadChildren: () =>
      import('./pages/registro/registro.module').then((m) => m.RegistroPageModule),
  },
  {
    path: 'propiedades',
    loadChildren: () =>
      import('./pages/propiedades/propiedades.module').then((m) => m.PropiedadesPageModule),
  },
  { path: 'propiedad-form', component: PropiedadFormPage },
  { path: 'home', component: HomePage },
  {
  path: 'chat',
  loadComponent: () =>
    import('./pages/chat/chat.page').then((m) => m.ChatPage),
},
  {
    path: 'chat-group',
    loadChildren: () => import('./pages/chat-group/chat-group.module').then( m => m.ChatGroupPageModule)
  },
  {
    path: 'chat-details',
    loadChildren: () => import('./pages/chat-details/chat-details.module').then( m => m.ChatDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
