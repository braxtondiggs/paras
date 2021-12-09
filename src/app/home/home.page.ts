import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { map } from 'rxjs/operators';
import { DbService } from '../core/services';
import { CalendarComponentOptions, DayConfig, CalendarComponentMonthChange, CalendarComponent } from 'ion2-calendar';
import { ModalDetailComponent } from '../core/components/modal-detail/modal-detail.component';
import { Feed } from '../core/interface';
import dayjs, { Dayjs } from 'dayjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements AfterViewInit {
  index = true; // TODO: Save using storage config
  date: string = dayjs().format();
  items: Feed[];
  swiperOpts: SwiperOptions = {
    allowTouchMove: false,
    initialSlide: this.location.path().includes('calendar') ? 1 : 0
  };
  calendarOpts: CalendarComponentOptions = {
    daysConfig: [],
    from: new Date(2019, 11, 1),
    to: dayjs().year(2021).endOf('year').toDate()
  };
  @ViewChild('calendar') cal: CalendarComponent;
  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  constructor(private db: DbService, private modal: ModalController, private location: Location) { }

  async onSelect(date: string) {
    const item = this.items.find((o) => dayjs(o.date.toDate()).isSame(date, 'day')) || dayjs(date);
    const modal = await this.modal.create({
      component: ModalDetailComponent,
      componentProps: {
        item
      }
    });
    return await modal.present();
  }

  ngAfterViewInit(): void {
    this.getData(dayjs().startOf('month'), dayjs().endOf('month'));
  }

  onMonthChange($event: CalendarComponentMonthChange): void {
    this.getData(dayjs($event.newMonth.dateObj), dayjs($event.newMonth.dateObj).endOf('month'));
  }

  switchCalenderView() {
    this.index = !this.index;
    this.swiper.swiperRef.slideTo(this.index ? 0 : 1);
    this.location.replaceState(`/home${this.index ? '' : '/calendar'}`);
  }

  private getData(start: Dayjs, end: Dayjs) {
    this.db.collection$('feed', (ref) =>
      ref
        .where('date', '>=', start.toDate())
        .where('date', '<', end.toDate())
        .where('type', '==', 'NYC'))
      .pipe(
        map((item: Feed[]) => item.filter(o => !o.active || !o.metered)))
      .subscribe((items) => {
        this.items = items;
        const daysConfig: DayConfig[] = items.map(item => ({
          cssClass: this.getCalendarClass(item),
          date: item.date.toDate(),
          marked: true
        }));
        this.calendarOpts.daysConfig = daysConfig;
        this.cal.options = this.calendarOpts;
      });
  }

  private getCalendarClass(item: Feed): string | undefined {
    if (item.active) {
      return 'active';
    } else if (item.metered) {
      return 'metered';
    }
  }
}
