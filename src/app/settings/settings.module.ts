import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LaunchReview } from '@ionic-native/launch-review/ngx';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { SettingsPage } from './settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: SettingsPage
      }
    ])
  ],
  declarations: [SettingsPage],
  providers: [EmailComposer, LaunchReview, InAppPurchase2]
})
export class SettingsPageModule { }
