import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HorizontalCalendarComponent } from '../core/components/horizontal-calendar/horizontal-calendar.component';
import { CalendarModule } from 'ion2-calendar';
import { HomePage } from './home.page';

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
      }
    ])
  ],
  declarations: [HomePage, HorizontalCalendarComponent]
})
export class HomePageModule { }
