import { Component, OnInit, ViewChild } from '@angular/core';
import { concat, filter, first, isEmpty, orderBy, last } from 'lodash-es';
import { DbService } from '../../services';
import { Calendar, Feed } from '../../interface';
import { LoadingController } from '@ionic/angular';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import advancedFormat from 'dayjs/plugin/advancedFormat';

@Component({
  selector: 'horizontal-calendar',
  templateUrl: './horizontal-calendar.component.html',
  styleUrls: ['./horizontal-calendar.component.scss'],
})
export class HorizontalCalendarComponent implements OnInit {
  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;
  loading: any;
  isLoading = true;
  selected?: Feed | Dayjs;
  feed?: Feed[];
  active?: Calendar;
  items: Calendar[] = [];
  swiperOpts: SwiperOptions = {
    centeredSlides: true,
    initialSlide: 6,
    slidesPerView: 7,
    spaceBetween: 4
  };
  constructor(private db: DbService, private loadingCtl: LoadingController) { }

  async ngOnInit() {
    dayjs.extend(isSameOrBefore);
    dayjs.extend(advancedFormat);
    this.loading = await this.loadingCtl.create();
    this.loading.present();
    this.items = this.getDatesBetween();
    this.active = this.items[this.swiperOpts.initialSlide ?? 0];
    this.getData();
  }

  async onSlideChange() {
    if (!this.swiper) return;
    const index = this.swiper.swiperRef.activeIndex;
    if (this.items.length - 3 <= index) {
      await this.slideEnd();
    } else if (index <= 2) {
      await this.slideStart();
    }
    this.active = this.items[index];
    this.getData();
  }

  hasNotice(calendar: Calendar, feed: Feed[]): boolean {
    if (feed) {
      const item = this.getSelectedItem(calendar, feed);
      return item ? !item.active : false;
    }
    return false;
  }

  private getSelectedItem(calendar: Calendar, feed: Feed[]): Feed | undefined {
    const filteredFeed = filter(feed, (o => dayjs(o.date.toDate()).isSame(calendar.date, 'day')));
    if (isEmpty(filteredFeed)) return;
    return first(orderBy(filteredFeed, (o => o.date.seconds), ['desc']));
  }

  private async slideEnd() {
    const date = last(this.items);
    if (!date) return;
    const end = dayjs(date.text).add(10, 'day');
    this.items = concat(this.items, this.getDatesBetween(dayjs(date.text).add(1, 'day'), end));
  }

  private async slideStart() {
    const date = first(this.items);
    if (!date) return;
    this.swiper?.swiperRef.slideTo(7, 0);
    const start = dayjs(date.text).subtract(5, 'days');
    this.items = concat(this.getDatesBetween(start, dayjs(date.text).subtract(1, 'day')));
  }

  private getDatesBetween(startDate?: Dayjs, endDate?: Dayjs): Calendar[] {
    let start = startDate || dayjs().subtract(6, 'days');
    const end = endDate || dayjs().add(6, 'day');
    const dates: Calendar[] = [];
    while (start.isSameOrBefore(end)) {
      dates.push(this.getCalenderFormat(start));
      start = start.add(1, 'day');
    }
    return dates;
  }

  private getData() {
    const active = this.active;
    const start = first(this.items);
    const end = last(this.items);
    if (!start || !end || !active) return;
    this.db.collection$('feed', (ref) =>
      ref
        .where('date', '>=', start.date)
        .where('date', '<', end.date)
        .where('type', '==', 'NYC'))
      .subscribe((feed) => {
        this.selected = this.getSelectedItem(active, feed) || dayjs(active.date);
        this.feed = feed;
        setTimeout(() => {
          this.isLoading = false;
          this.loading.dismiss();
        }, 250);
      });
  }

  private getCalenderFormat(date: Dayjs): Calendar {
    return {
      text: date.format(),
      date: date.toDate(),
      month: {
        short: date.format('MMM'),
        long: date.format('MMMM')
      },
      day: {
        short: date.format('ddd'),
        long: date.format('dddd'),
        num: date.format('DD')
      }
    };
  }
}
