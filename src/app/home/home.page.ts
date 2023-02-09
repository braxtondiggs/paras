import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { CalendarComponentOptions, DayConfig, CalendarComponentMonthChange, CalendarComponent, CalendarComponentPayloadTypes } from 'ion2-calendar';
import { ModalDetailComponent } from '../core/components/modal-detail/modal-detail.component';
import { Feed } from '../core/interface';
import { FeedService } from '../core/services';
import dayjs, { Dayjs } from 'dayjs';
import { first, orderBy } from 'lodash-es';

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

  constructor(private feed: FeedService, private modal: ModalController, private location: Location) { }

  async onChange(date: CalendarComponentPayloadTypes) {
    const items = this.items.filter((o) => dayjs(o.date.toDate()).isSame(date.toString(), 'day'));
    const item = first(orderBy(items, (o => o.created.seconds), ['desc'])) || dayjs(date.toString());
    const modal = await this.modal.create({
      component: ModalDetailComponent,
      cssClass: 'fullscreen',
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
    this.feed.get(start, end).subscribe((items) => {
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
    this.feed.getLast().subscribe(([item]) => {
      this.calendarOpts.to = item.date.toDate();
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
