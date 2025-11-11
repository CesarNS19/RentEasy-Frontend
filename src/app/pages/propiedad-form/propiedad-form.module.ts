import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PropiedadFormPage } from './propiedad-form.page';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./propiedad-form.page').then(m => m.PropiedadFormPage)
  },
];

@NgModule({
  declarations: [PropiedadFormPage],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: PropiedadFormPage }]),
  ],
})
export class PropiedadFormPageModule {}
