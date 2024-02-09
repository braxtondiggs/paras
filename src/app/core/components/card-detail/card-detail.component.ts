import { Component, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { NgIf } from '@angular/common';

import { IonCard, IonCardContent, IonCardHeader, IonIcon, IonItem, IonList, IonText } from '@ionic/angular/standalone';

import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import { addIcons } from 'ionicons';
import { closeCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

import { Feed, Item } from '../../interface';

@Component({
  standalone: true,
  imports: [
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonIcon,
    IonItem,
    IonList,
    IonText,
    NgIf
  ],
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent implements OnChanges {
  detail?: Item;
  @Input() item?: Feed | Dayjs;

  constructor() {
    dayjs.extend(relativeTime);
    dayjs.extend(advancedFormat);
    addIcons({ closeCircleOutline, checkmarkCircleOutline });
  }

  ngOnChanges(changes: SimpleChanges) {
    const currentItem: SimpleChange = changes['item'];
    if (currentItem.currentValue) {
      const data: Feed | Dayjs = changes['item'].currentValue;
      if (!dayjs.isDayjs(data)) {
        this.detail = {
          ...data,
          created: dayjs(data.created.toDate()).fromNow(),
          date: dayjs(data.date.toDate()).format('MMMM Do YYYY'),
          lastUpdated: dayjs(data.date.toDate()).isSame(dayjs(), 'day') ||
          dayjs(data.date.toDate()).isSame(dayjs().add(1, 'day'), 'day')
        };
      } else {
        this.detail = {
          active: true,
          created: data.fromNow(),
          date: data.format('MMMM Do YYYY'),
          metered: true,
          lastUpdated: data.isSame(dayjs(), 'day')
        };
      }
    }
  }
}
