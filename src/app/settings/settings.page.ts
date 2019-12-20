import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DbService, AuthService } from '../core/services';
import { Setting } from '../core/interface';
import * as moment from 'moment';
import { skip, distinctUntilChanged, take } from 'rxjs/operators';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  uid: string;
  settings: Setting;
  settingsForm: FormGroup;
  constructor(fb: FormBuilder, private db: DbService, private auth: AuthService) {
    this.settings = {
      today: '',
      todayCustom: moment().format(),
      nextDay: '',
      nextDayCustom: moment().format()
    };
    this.settingsForm = fb.group(this.settings);
  }

  async ngOnInit() {
    this.uid = await this.auth.uid();
    this.db.doc$(`notifications/${this.uid}`).pipe(take(1)).subscribe((settings: Setting) => {
      this.settingsForm.patchValue({ ...settings, ...this.settings });
    });

    this.settingsForm.valueChanges.pipe(skip(1), distinctUntilChanged()).subscribe((val) => {
      const data = {
        todayCustom: moment(val.todayCustom).format('h:mm A'),
        nextDayCustom: moment(val.nextDayCustom).format('h:mm A')
      };
      this.db.updateAt(`notifications/${this.uid}`, { ...val, ...data }).then(() => {
        // TODO: Show Success Message
      }).catch(() => {
        // TODO: Show Error Message
      });
    });
  }
}
