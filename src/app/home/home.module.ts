import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SwiperModule } from 'swiper/angular';
import { CalendarModule } from 'ion2-calendar';
import { HomePage } from './home.page';
import { CardDetailComponent } from '../core/components/card-detail/card-detail.component';
import { HorizontalCalendarComponent } from '../core/components/horizontal-calendar/horizontal-calendar.component';
import { ModalDetailComponent } from '../core/components/modal-detail/modal-detail.component';
import { TwitterCommentsComponent } from 'app/core/components/twitter-comments/twitter-comments.component';
import { FeedService } from 'app/core/services';

@NgModule({
  imports: [
    CalendarModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage,
        data: { title: 'Home' },
      },
      {
        path: 'calendar',
        component: HomePage,
        data: { title: 'Calender' },
      }
    ]),
    SwiperModule
  ],
  declarations: [
    CardDetailComponent,
    HomePage,
    HorizontalCalendarComponent,
    ModalDetailComponent,
    TwitterCommentsComponent
  ],
  providers: [
    FeedService
  ]
})
export class HomePageModule { }
