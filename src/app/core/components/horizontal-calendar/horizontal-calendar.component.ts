import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import * as moment from 'moment';
import { concat, filter, first, orderBy, last } from 'lodash-es';
import { DbService } from '../../services';
import { Calendar, Feed } from '../../interface';
@Component({
  selector: 'horizontal-calendar',
  templateUrl: './horizontal-calendar.component.html',
  styleUrls: ['./horizontal-calendar.component.scss'],
})
export class HorizontalCalendarComponent implements OnInit {
  @ViewChild('slider', { static: false }) slider: IonSlides;
  feed: Feed[];
  active: Calendar;
  items: Calendar[] = [];
  slideOpts = {
    slidesPerView: 5,
    initialSlide: 2
  };
  constructor(private db: DbService) { }

  ngOnInit() {
    this.items = this.getDatesBetween();
    const index = Math.round(this.items.length / 2);
    this.active = this.items[index];
    this.getData();
  }

  async onSlideChange() {
    const index = await this.slider.getActiveIndex();
    this.active = this.items[index + 2];
  }

  slideEnd() {
    const date = last(this.items);
    const end = moment(date.text).add(10, 'days');
    this.items = concat(this.items, this.getDatesBetween(moment(date.text).add(1, 'days'), end));
  }

  async slideStart() {
    const date = first(this.items);
    const start = moment(date.text).subtract(5, 'days');
    this.items = concat(this.getDatesBetween(start, moment(date.text).subtract(1, 'days')));
    await this.slider.update();
    setTimeout(async () => await this.slider.slideTo(5, 100), 0);
  }

  private getDatesBetween(startDate?: moment.Moment, endDate?: moment.Moment): Calendar[] {
    const start = startDate || moment().subtract(4, 'days');
    const end = endDate || moment().add(4, 'days');
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
        .where('date', '<', end.date))
      .subscribe((feed) => this.feed = feed);
  }

  hasNotice(calendar: Calendar, feed: Feed[]): boolean {
    if (feed) {
      const item = first(orderBy(filter(feed,
        (o => moment(o.date.toDate()).isSame(calendar.date, 'day'))),
        (o => o.date.seconds), ['asc']));
      return item ? !item.active : false;
    }
    return false;
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
