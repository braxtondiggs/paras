import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { IntroPage } from './intro.page';

@NgModule({
  imports: [
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: IntroPage
      }
    ])
  ],
  declarations: [IntroPage]
})
export class IntroPageModule { }
