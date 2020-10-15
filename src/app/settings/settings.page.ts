import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DbService, AuthService, FcmService } from '../core/services';
import { Setting } from '../core/interface';
import * as moment from 'moment';
import { omitBy, isNil } from 'lodash-es';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { AlertController, IonDatetime, LoadingController, ToastController } from '@ionic/angular';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  uid: string;
  settings: Setting;
  settingsForm: FormGroup;
  isLoading = true;
  format = 'h:mm A z';
  @ViewChild('todayDatePicker') today: IonDatetime;
  @ViewChild('nextdayDatePicker') nextday: IonDatetime;
  constructor(
    fb: FormBuilder,
    private alert: AlertController,
    private db: DbService,
    private auth: AuthService,
    private fcm: FcmService,
    private loading: LoadingController,
    private toast: ToastController) {
    this.settings = {
      today: 'none',
      todayCustom: moment().format(),
      nextDay: 'none',
      nextDayCustom: moment().format(),
      exceptionOnly: false,
      weekend: false,
      darkMode: localStorage.getItem('darkMode') === 'true'
    };
    this.settingsForm = fb.group(this.settings);
  }

  async ngOnInit() {
    this.uid = await this.auth.uid();
    const loading = await this.loading.create();
    loading.present();
    this.db.doc$(`notifications/${this.uid}`).pipe(take(1)).subscribe((settings: Setting) => {
      settings = {
        ...settings,
        todayCustom: moment.utc(settings.todayCustom, this.format).local().format(),
        nextDayCustom: moment.utc(settings.nextDayCustom, this.format).local().format()
      };
      this.settingsForm.patchValue({ ...this.settings, ...settings }, { emitEvent: false, onlySelf: true });
      this.settings = settings;
      setTimeout(() => {
        this.isLoading = false;
        loading.dismiss();
      });
    });

    this.settingsForm.controls.today.valueChanges.pipe(distinctUntilChanged()).subscribe(async (today) => {
      if (!today) { return; }
      if (today === 'custom') {
        await this.today.open();
      } else {
        this.save({ today });
      }
    });

    this.settingsForm.controls.nextDay.valueChanges.pipe(distinctUntilChanged()).subscribe(async (nextDay) => {
      if (!nextDay) { return; }
      if (nextDay === 'custom') {
        await this.nextday.open();
      } else {
        this.save({ nextDay });
      }
    });

    this.settingsForm.controls.darkMode.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
      localStorage.setItem('darkMode', value.toString());
      document.body.classList.toggle('dark', value);
    });
  }

  save(data: Setting): void {
    let t: HTMLIonToastElement;
    data = omitBy({ ...data, token: this.fcm.token, type: 'NYC' }, isNil);
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
        message: 'An error has occured.'
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
        return `Next notification around ${type === 'today' ? '7:30AM' : '4:00PM'}`;
      case 'custom':
        return `Next notification at ${moment(time).format('h:mm A')}`;
      default:
        break;
    }
  }

  async onTodayChange(date: string) {
    if (moment(date, 'YYYY-MM-DD HH:mmZ').isBefore(moment().set({ hour: 7, minute: 29 }))) {
      const alert = await this.alert.create({
        header: 'Invalid Time',
        message: 'The time you have selected is too early, please select a time before 7:30AM.',
        buttons: [{
          text: 'Okay',
          handler: () => { this.settingsForm.controls.today.patchValue(this.settings.today); }
        }]
      });
      await alert.present();
      return;
    }
    this.save({ today: this.settingsForm.value.today, todayCustom: moment.utc(date, 'YYYY-MM-DD HH:mmZ').format(this.format) });
  }

  onTodayCancel() {
    this.settingsForm.controls.today.patchValue(this.settings.today);
  }

  async onNextDateChange(date: string) {
    if (moment(date, 'YYYY-MM-DD HH:mmZ').isBefore(moment().set({ hour: 15, minute: 59 }))) {
      const alert = await this.alert.create({
        header: 'Invalid Time',
        message: 'The time you have selected is too early, please select a time before 4:00PM.',
        buttons: [{
          text: 'Okay',
          handler: () => { this.settingsForm.controls.nextDay.patchValue(this.settings.nextDay); }
        }]
      });
      await alert.present();
      return;
    }
    this.save({ nextDay: this.settingsForm.value.nextDay, nextDayCustom: moment.utc(date, 'YYYY-MM-DD HH:mmZ').format(this.format) });
  }

  onNextDateCancel() {
    this.settingsForm.controls.nextDay.patchValue(this.settings.nextDay);
  }
}
