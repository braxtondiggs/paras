import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, ChangeDetectorRef } from '@angular/core';
import { Calendar, Feed } from '../../interface';
import { FeedService } from 'app/core/services';
import { LoadingController, IonRippleEffect, IonButton, IonIcon } from '@ionic/angular/standalone';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { NgFor, NgIf, NgClass } from '@angular/common';

import { addIcons } from 'ionicons';
import { arrowBack, arrowForward } from 'ionicons/icons';
import { register } from 'swiper/element/bundle';
import { CardDetailComponent } from '../card-detail/card-detail.component';

@Component({
  standalone: true,
  imports: [
    CardDetailComponent,
    IonRippleEffect,
    IonButton,
    IonIcon,
    NgFor,
    NgIf,
    NgClass
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'horizontal-calendar',
  templateUrl: './horizontal-calendar.component.html',
  styleUrls: ['./horizontal-calendar.component.scss'],
})
export class HorizontalCalendarComponent implements OnInit {
  @ViewChild('swiper', { static: false }) public swiper?: ElementRef | undefined;
  loading: any;
  isLoading = true;
  selected?: Feed | Dayjs;
  feeds?: Feed[];
  active?: Calendar;
  items: Calendar[] = [];
  private cd = inject(ChangeDetectorRef);
  constructor(private feed: FeedService, private loadingCtl: LoadingController) {
    addIcons({ arrowBack, arrowForward });
  }

  async ngOnInit() {
    dayjs.extend(isSameOrBefore);
    dayjs.extend(advancedFormat);
    this.loading = await this.loadingCtl.create();
    this.loading.present();
    this.items = this.getDatesBetween();
    this.active = this.items[6];
    this.getData();
    register();
  }

  async onSlideChange() {
    const index = this.swiper?.nativeElement?.swiper?.activeIndex;
    if (!index) return;
    if (this.items.length - 3 <= index) {
      await this.slideEnd();
    } else if (index <= 2) {
      await this.slideStart();
    }
    this.active = this.items[index];
    this.getData();
  }

  public slideTo(index: number, speed = 250) {
    this.swiper?.nativeElement.swiper.slideTo(index, speed);
  }

  public slideNext() {
    this.swiper?.nativeElement.swiper.slideNext();
  }
  
  public slidePrev() {
    this.swiper?.nativeElement.swiper.slidePrev();
  }

  public hasNotice(calendar: Calendar, feed: Feed[] | undefined): boolean {
    if (feed) {
      const item = this.getSelectedItem(calendar, feed);
      return item ? !item.active : false;
    }
    return false;
  }

  private getSelectedItem(calendar: Calendar, feed: Feed[]): Feed | undefined {
    const filteredFeed = feed.filter((o => dayjs(o.date.toDate()).isSame(calendar.date, 'day')));
    if (filteredFeed.length === 0) return;
    return filteredFeed[0];
  }

  private async slideEnd() {
    const date = this.items[this.items.length - 1];
    if (!date) return;
    const end = dayjs(date.text).add(10, 'day');
    this.items = this.items.concat(this.getDatesBetween(dayjs(date.text).add(1, 'day'), end));
    this.cd.detectChanges();
    this.swiper?.nativeElement.swiper.update();
  }

  private async slideStart() {
    const date = this.items[0];
    if (!date) return;
    const start = dayjs(date.text).subtract(5, 'days');
    this.items = this.getDatesBetween(start, dayjs(date.text).subtract(1, 'day')).concat(this.items);
    this.slideTo(7, 0);
    this.cd.detectChanges();
    this.swiper?.nativeElement.swiper.update();
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
    const start = this.items[0];
    const end = this.items[this.items.length - 1];
    if (!start || !end || !active) return;
    this.feed.get(dayjs(start.date), dayjs(end.date)).subscribe((feed) => {
      this.selected = this.getSelectedItem(active, feed) || dayjs(active.date);
      this.feeds = feed;
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
