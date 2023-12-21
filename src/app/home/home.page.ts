import { Component, ElementRef, ViewChild, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ModalDetailComponent } from '../core/components/modal-detail/modal-detail.component';
import { Feed } from '../core/interface';
import { FeedService } from '../core/services';
import dayjs, { Dayjs } from 'dayjs';
import { lastValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { calendarOutline, settingsOutline } from 'ionicons/icons';
import { IonRouterLink, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons,  IonContent, IonIcon, ModalController, IonDatetime, PickerColumnOption  } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { HorizontalCalendarComponent } from 'app/core/components/horizontal-calendar/horizontal-calendar.component';

@Component({
  imports: [
    ModalDetailComponent,
    HorizontalCalendarComponent,
    IonButton,
    IonButtons,
    IonContent,
    IonDatetime,
    IonHeader,
    IonIcon,
    IonRouterLink,
    IonRouterLink,
    IonTitle,
    IonToolbar,
    RouterLink
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-home',
  standalone: true,
  styleUrls: ['home.page.scss'],
  templateUrl: './home.page.html'
})

export class HomePage implements AfterViewInit {
  public minDate: string = dayjs().startOf('year').toISOString();
  public maxDate: string = dayjs().endOf('year').toISOString();
  public selectedDate: string = dayjs().toISOString();
  public items: Feed[] = [];
  public highlightedDates: any[] = [];
  public activeSlide = 0;
  private router = inject(Router);
  
  @ViewChild('swiper', { static: false }) swiper?: ElementRef | undefined;
  @ViewChild('calendar', { read: ElementRef, static: false }) calendar?: ElementRef;
  constructor(private feed: FeedService, private modal: ModalController) {
    this.activeSlide = this.router.url.includes('calendar') ? 1 : 0;
    addIcons({ calendarOutline, settingsOutline });
  }

  async onChange({ detail }: CustomEvent<PickerColumnOption>) {
    this.selectedDate = dayjs().toISOString(); // force
    const { value } = detail;
    const date = dayjs(value);
    const item = this.items.find((o) => dayjs(o.date.toDate()).isSame(date, 'day')) || dayjs(date.toString());
    const modal = await this.modal.create({
      component: ModalDetailComponent,
      cssClass: 'fullscreen',
      componentProps: {
        item
      }
    });
    return await modal.present();
  }

  async ngAfterViewInit(): Promise<void> {
    await this.getLastDate();
    this.getData(dayjs(this.minDate), dayjs(this.maxDate));
  }

  switchCalenderView() {
    this.activeSlide = this.activeSlide ? 0 : 1;
    this.swiper?.nativeElement.swiper?.slideTo(this.activeSlide);
    this.router.navigate([`/home${this.activeSlide ? '/calendar' : ''}`], { replaceUrl: true });
  }

  private getData(start: Dayjs, end: Dayjs) {
    this.feed.get(start, end).subscribe((items) => {
      this.items = items;
      this.highlightedDates = items.map((o) => ({
        date: dayjs(o.date.toDate()).format('YYYY-MM-DD'),
        backgroundColor: '#f38181',
        textColor: '#fff'
      }));
    });
  }

  private async getLastDate() {
    const { date } = await lastValueFrom(this.feed.getLast());
    this.maxDate = dayjs(date.toDate()).endOf('month').subtract(1, 'day').toISOString();
  }
}
