import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DbService, AuthService } from '../core/services';
import { Setting } from '../core/interface';
import * as moment from 'moment';
import { skip, distinctUntilChanged, take } from 'rxjs/operators';
import { ToastController, IonDatetime } from '@ionic/angular';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  uid: string;
  settings: Setting;
  settingsForm: FormGroup;
  @ViewChild('todayDatePicker', { static: false }) today: IonDatetime;
  @ViewChild('nextdayDatePicker', { static: false }) nextday: IonDatetime;
  constructor(
    fb: FormBuilder,
    private db: DbService,
    private auth: AuthService,
    private toast: ToastController) {
    this.settings = {
      today: 'none',
      todayCustom: moment().format(),
      nextDay: 'none',
      nextDayCustom: moment().format()
    };
    this.settingsForm = fb.group(this.settings);
  }

  async ngOnInit() {
    this.uid = await this.auth.uid();
    this.db.doc$(`notifications/${this.uid}`).pipe(take(1)).subscribe((settings: Setting) => {
      settings = {
        ...settings,
        todayCustom: moment(settings.todayCustom, 'h:mm A').format(),
        nextDayCustom: moment(settings.nextDayCustom, 'h:mm A').format()
      };
      this.settingsForm.patchValue({ ...this.settings, ...settings });
    });

    this.settingsForm.controls.today.valueChanges.pipe(skip(1), distinctUntilChanged()).subscribe(async (today) => {
      if (today === 'custom') {
        await this.today.open();
        this.today.ionChange.subscribe((data: CustomEvent) =>
          this.save({ today, todayCustom: moment(data.detail.value).format('h:mm A') })
        );
        this.today.ionCancel.subscribe(() => this.settingsForm.controls.today.patchValue('none'));
      } else {
        this.save({ today });
      }
    });

    this.settingsForm.controls.nextDay.valueChanges.pipe(skip(1), distinctUntilChanged()).subscribe(async (nextDay) => {
      if (nextDay === 'custom') {
        await this.nextday.open();
        this.nextday.ionChange.subscribe((data: CustomEvent) =>
          this.save({ nextDay, nextDayCustom: moment(data.detail.value).format('h:mm A') })
        );
        this.nextday.ionCancel.subscribe(() => this.settingsForm.controls.nextDay.reset());
        return;
      } else {
        this.save({ nextDay });
      }
    });
  }

  private save(data: Setting): void {
    let t: HTMLIonToastElement;
    this.db.updateAt(`notifications/${this.uid}`, data).then(async () => {
      t = await this.toast.create({
        color: 'dark',
        duration: 1500,
        message: 'Your settings have been saved.'
      });
    }).catch(async () => {
      t = await this.toast.create({
        color: 'dark',
        duration: 1500,
        message: 'Your settings have been saved.'
      });
    }).finally(() => {
      t.present();
    });
  }

  getNotificationMessage(type: string, action: string): string {
    const time = type === 'today' ? this.settingsForm.value.todayCustom : this.settingsForm.value.nextDayCustom;
    switch (action) {
      case 'none':
        return 'Get notified about alternate side parking';
      case 'immediately':
        return 'Next notification around 4pm';
      case 'custom':
        return `Next notification at ${moment(time).format('h:mm A')}`;
      default:
        break;
    }
  }
}
