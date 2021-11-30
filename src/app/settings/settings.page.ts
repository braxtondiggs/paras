import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DbService, AuthService } from '../core/services';
import { Setting } from '../core/interface';
import { omitBy, isNil, isEmpty } from 'lodash-es';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { AlertController, IonDatetime, LoadingController, ToastController } from '@ionic/angular';
import { LaunchReview } from '@ionic-native/launch-review/ngx';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { EmailComposer } from 'capacitor-email-composer';
import * as moment from 'moment';

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
  format = 'H:mm';
  isFirst = false;
  @ViewChild('todayDatePicker') today: IonDatetime;
  @ViewChild('nextdayDatePicker') nextday: IonDatetime;
  constructor(
    fb: FormBuilder,
    private alert: AlertController,
    private auth: AuthService,
    private db: DbService,
    private launchReview: LaunchReview,
    private loading: LoadingController,
    private store: InAppPurchase2,
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
      this.isFirst = isEmpty(settings.updateAt);
      if (settings.todayCustom) settings.todayCustom = moment().set(this.getTime(settings.todayCustom)).format();
      if (settings.nextDayCustom) settings.nextDayCustom = moment().set(this.getTime(settings.nextDayCustom)).format();
      this.settings = { ...this.settings, ...settings };
      this.settingsForm.patchValue(this.settings, { emitEvent: false, onlySelf: true });
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
    const createdAt = this.isFirst ? new Date() : null; //token: this.fcm.token
    data = omitBy({ ...data, type: 'NYC', updateAt: new Date(), createdAt }, isNil);
    if (!isEmpty(data.token)) {
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
        this.isFirst = false;
      });
    }
  }

  private getTime(time: string): { hour: number, minute: number } {
    if (!time) return { hour: moment().get('hour'), minute: moment().get('minute') };
    const [hour, minute] = time.split(':');
    return { hour: +hour, minute: +minute };
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
          handler: () => this.settingsForm.controls.today.patchValue(this.settings.today)
        }]
      });
      await alert.present();
      return;
    }
    this.save({ today: this.settingsForm.value.today, todayCustom: moment(date, 'YYYY-MM-DD HH:mmZ').format(this.format) });
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
          handler: () => this.settingsForm.controls.nextDay.patchValue(this.settings.nextDay)
        }]
      });
      await alert.present();
      return;
    }
    this.save({ nextDay: this.settingsForm.value.nextDay, nextDayCustom: moment(date, 'YYYY-MM-DD HH:mmZ').format(this.format) });
  }

  onNextDateCancel() {
    this.settingsForm.controls.nextDay.patchValue(this.settings.nextDay);
  }

  rate() {
    if (this.launchReview.isRatingSupported()) {
      this.launchReview.launch();
    }
  }

  async about() {
    const alert = await this.alert.create({
      header: 'ASP For NYC',
      message: 'This app was built and designed by Braxton Diggs of Cymbit Creative Studios.<br /><br />For more info and inquiries, email us at <strong>braxtondiggs@gmail.com</strong>',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }, {
          text: 'Contact Us',
          handler: () => {
            EmailComposer.open({ to: ['braxtondiggs@gmail.com'], subject: 'ASP for NYC' });
          }
        }
      ]
    });

    await alert.present();
  }

  async donate() {
    const alert = await this.alert.create({
      header: 'Support Development',
      message: 'Hello, there! Hundreds of hours have been put into developing and perfecting ASP, so if you use this app quite often, why not considering supporting development.<br /><br />Your support ensures that we can keep up development, keeping the app alive.',
      buttons: [
        {
          text: 'No, Thanks',
          role: 'cancel'
        }, {
          text: 'Yes, Please',
          handler: () => {
            this.store.register({
              id: 'donation_99',
              type: this.store.CONSUMABLE,
            });

            this.store.when('donation_99')
              .approved(p => p.verify())
              .verified(async (p) => {
                p.finish();
                const toast = await this.toast.create({ message: 'Your support is always appreciated!', duration: 10000 });
                toast.present();
              })
              .error(async () => {
                const toast = await this.toast.create({ message: 'Something went wrong', duration: 10000 });
                toast.present();
              });
            this.store.refresh();

            this.store.order('donation_99');
          }
        }
      ]
    });

    await alert.present();
  }
}
