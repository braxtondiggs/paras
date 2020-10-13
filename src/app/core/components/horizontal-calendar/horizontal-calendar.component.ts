import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { concat, filter, first, orderBy, last } from 'lodash-es';
import { DbService } from '../../services';
import { Calendar, Feed } from '../../interface';
import { LoadingController } from '@ionic/angular';
import moment from 'moment';
@Component({
  selector: 'horizontal-calendar',
  templateUrl: './horizontal-calendar.component.html',
  styleUrls: ['./horizontal-calendar.component.scss'],
})
export class HorizontalCalendarComponent implements OnInit {
  @ViewChild('slider', { static: false }) slider: IonSlides;
  loading: any;
  isLoading = true;
  selected: Feed | moment.Moment;
  feed: Feed[];
  active: Calendar;
  items: Calendar[] = [];
  slideOpts = {
    centeredSlides: true,
    initialSlide: 6,
    slidesPerView: 7,
    spaceBetween: 4
  };
  constructor(private db: DbService, private loadingCtl: LoadingController) { }

  async ngOnInit() {
    this.loading = await this.loadingCtl.create();
    this.loading.present();
    this.items = this.getDatesBetween();
    this.active = this.items[this.slideOpts.initialSlide];
    this.getData();
  }

  async onSlideChange() {
    const index = await this.slider.getActiveIndex();
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

  private getSelectedItem(calendar: Calendar, feed: Feed[]): Feed {
    return first(orderBy(filter(feed,
      (o => moment(o.date.toDate()).isSame(calendar.date, 'day'))),
      (o => o.date.seconds), ['asc']));
  }

  private async slideEnd() {
    const date = last(this.items);
    const end = moment(date.text).add(10, 'days');
    this.items = concat(this.items, this.getDatesBetween(moment(date.text).add(1, 'days'), end));
  }

  private async slideStart() {
    const date = first(this.items);
    await this.slider.slideTo(7, 0);
    const start = moment(date.text).subtract(5, 'days');
    this.items = concat(this.getDatesBetween(start, moment(date.text).subtract(1, 'days')));
  }

  private getDatesBetween(startDate?: moment.Moment, endDate?: moment.Moment): Calendar[] {
    const start = startDate || moment().subtract(6, 'days');
    const end = endDate || moment().add(6, 'days');
    const dates: Calendar[] = [];

    while (start.isBefore(end) || start.isSame(end)) {
      dates.push(this.getCalenderFormat(start));
      start.add(1, 'days');
    }
    return dates;
  }

  private getData() {
    const start = first(this.items);
    const end = last(this.items);
    this.db.collection$('feed', (ref) =>
      ref
        .where('date', '>=', start.date)
        .where('date', '<', end.date)
        .where('type', '==', 'NYC'))
      .subscribe((feed) => {
        this.selected = this.getSelectedItem(this.active, feed) || moment(this.active.date);
        this.feed = feed;
        setTimeout(() => {
          this.isLoading = false;
          this.loading.dismiss();
        }, 250);
      });
  }

  private getCalenderFormat(date: moment.Moment): Calendar {
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
