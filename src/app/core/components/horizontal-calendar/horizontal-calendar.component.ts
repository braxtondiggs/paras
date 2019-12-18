import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { clone, concat, last } from 'lodash-es';
@Component({
  selector: 'horizontal-calendar',
  templateUrl: './horizontal-calendar.component.html',
  styleUrls: ['./horizontal-calendar.component.scss'],
})
export class HorizontalCalendarComponent implements OnInit {
  items: Calender[] = [];
  slideOpts = {
    slidesPerView: 5,
    initialSlide: 2
  };
  constructor() { }

  ngOnInit() {
    this.items = this.getDatesBetween();
  }

  slideEnd() {
    const date = last(this.items);
    const end = moment(date.text).add(10, 'days');
    this.items = concat(this.items, this.getDatesBetween(moment(date.text), end));
  }

  slideStart() {

  }

  private getDatesBetween(startDate?: moment.Moment, endDate?: moment.Moment): Calender[] {
    const start = startDate || moment().subtract(4, 'days');
    const end = endDate || moment().add(4, 'days');
    const dates: Calender[] = [];

    while (start.isBefore(end) || start.isSame(end)) {
      dates.push(this.getCalenderFormat(start));
      start.add(1, 'days');
    }
    return dates;
  }

  private getCalenderFormat(date: moment.Moment): Calender {
    return {
      text: date.format(),
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

interface Calender {
  text: string;
  month: {
    short: string,
    long: string
  };
  day: {
    short: string,
    long: string,
    num: string
  };
}
