import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { map, take } from 'rxjs/operators';
import { DbService } from '../core/services';
import { CalendarComponentOptions, DayConfig, CalendarComponentMonthChange, CalendarComponent, CalendarComponentPayloadTypes } from 'ion2-calendar';
import { ModalDetailComponent } from '../core/components/modal-detail/modal-detail.component';
import { Feed } from '../core/interface';
import dayjs, { Dayjs } from 'dayjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements AfterViewInit {
  index = true;
  date: string = dayjs().format();
  items: Feed[] = [];
  swiperOpts: SwiperOptions = {
    allowTouchMove: false,
    initialSlide: this.location.path().includes('calendar') ? 1 : 0
  };
  calendarOpts: CalendarComponentOptions = {
    daysConfig: [],
    from: new Date(2019, 11, 1)
  };
  @ViewChild('calendar') cal?: CalendarComponent;
  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  constructor(private db: DbService, private modal: ModalController, private location: Location) { }

  async onChange(date: CalendarComponentPayloadTypes) {
    const item = this.items.find((o) => dayjs(o.date.toDate()).isSame(date.toString(), 'day')) || dayjs(date.toString());
    const modal = await this.modal.create({
      component: ModalDetailComponent,
      componentProps: {
        item
      }
    });
    return await modal.present();
  }

  ngAfterViewInit(): void {
    this.getLastDate();
    this.getData(dayjs().startOf('month'), dayjs().endOf('month'));
  }

  onMonthChange($event: CalendarComponentMonthChange): void {
    this.getData(dayjs($event.newMonth.dateObj), dayjs($event.newMonth.dateObj).endOf('month'));
  }

  switchCalenderView() {
    this.index = !this.index;
    this.swiper?.swiperRef.slideTo(this.index ? 0 : 1);
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
        if (this.cal) this.cal.options = this.calendarOpts;
      });
  }

  private getLastDate() {
    this.db.collection$('feed', (ref) => ref.limit(1).orderBy('date', 'desc')).pipe(take(1)).subscribe((item) => {
        if (!item.length) return;
        this.calendarOpts.to = item[0].date.toDate();
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
