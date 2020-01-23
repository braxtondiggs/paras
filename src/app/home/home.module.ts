import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HorizontalCalendarComponent } from '../core/components/horizontal-calendar/horizontal-calendar.component';
import { CalendarModule } from 'ion2-calendar';
import { HomePage } from './home.page';
import { ModalDetailComponent } from '../core/components/modal-detail/modal-detail.component';
import { CardDetailComponent } from '../core/components/card-detail/card-detail.component';

@NgModule({
  imports: [
    CalendarModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      },
      {
        path: 'calendar',
        component: HomePage
      }
    ])
  ],
  declarations: [HomePage, HorizontalCalendarComponent, ModalDetailComponent, CardDetailComponent],
  entryComponents: [ModalDetailComponent]
})
export class HomePageModule { }
