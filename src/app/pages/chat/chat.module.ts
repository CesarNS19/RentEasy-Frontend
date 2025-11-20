import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatPage } from './chat.page';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [ChatPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ]
})
export class ChatPageModule {}
