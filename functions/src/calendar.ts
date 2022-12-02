import db from './db';
import * as functions from 'firebase-functions';
import * as dayjs from 'dayjs';
import * as cheerio from 'cheerio';
import { isNull, replace } from 'lodash';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const Sherlock = require('sherlockjs');
// const uri = 'https://www1.nyc.gov/html/dot/html/motorist/alternate-side-parking.shtml';
const YEAR = 2023;
Sherlock._setNow(dayjs(`${YEAR}-01-01T12:00:00.000Z`).toDate());

export async function NYCalender(_request: functions.Request, response: functions.Response) {
   const $ = cheerio.load(getHTML());
   const promise: Promise<FirebaseFirestore.WriteResult>[] = [];

   $('table tbody tr').each((_index, tr) => {
      const collection: string[] = [];
      $('td', tr).each((_, td) => collection.push($(td).text()));
      if (!collection.length) return;
      const [date, title] = collection;
      
      const data = getDate(date)?.map(date => ({
         active: false,
         created: dayjs().toDate(),
         date: dayjs(date).hour(12).minute(0).second(0).toDate(),
         id: dayjs(date).format('MMDDYYYY'),
         metered: true,
         text: `Rules are suspended today, ${dayjs(date).format('MMMM D')}.`,
         reason: replace(title, '*', ''),
         type: 'NYC'
      }));
      
      data?.forEach((item: any) => promise.push(db.doc(`feed/${item.id}`).set(item)));
   });
   const res = await Promise.all(promise);
   response.send(res);
}

function getDaysArray(start: Date, end: Date): Date[] {
   let arr: Date[], dt: Date;
   for (arr = [], dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
     arr.push(new Date(dt));
   }
   return arr;
 }

function getDate(text: string): Date[] | undefined {
   const [dateText] = text.toLowerCase().replace('sept ', 'september ').split(', '); // NOTE: SherlockJS doesn't support 'sept' as a month -> https://github.com/neilgupta/Sherlock/issues/37
   const sherlocked = Sherlock.parse(dateText);
   if (isNull(sherlocked.startDate) && isNull(sherlocked.endDate)) return;
   if (isNull(sherlocked.endDate)) return [sherlocked.startDate];
   return getDaysArray(sherlocked.startDate, sherlocked.endDate);
}

function getHTML() {
   return `<table class="tg">
   <tbody>
      <tr>
         <th class="header">Date</th>
         <th class="header">Holiday</th>
      </tr>
      <tr>
         <td>Jan 1, Sun</td>
         <td>New Year's Day</td>
      </tr>
      <tr>
         <td>Jan 2, Mon</td>
         <td>New Year's Day (Observed)</td>
      </tr>
      <tr>
         <td>Jan 6, Fri</td>
         <td>Three Kings' Day</td>
      </tr>
      <tr>
         <td>Jan 16, Mon</td>
         <td>Martin Luther King, Jr. Day</td>
      </tr>
      <tr>
         <td>Jan 21-Jan 22, Sat-Sun</td>
         <td>Lunar New Year's Eve &amp; Lunar New Year</td>
      </tr>
      <tr>
         <td>Feb 13, Mon</td>
         <td>Lincoln's Birthday (Observed)</td>
      </tr>
      <tr>
         <td>Feb 20, Mon</td>
         <td>Washington's Birthday (Presidents' Day)</td>
      </tr>
      <tr>
         <td>Feb 22, Wed</td>
         <td>Ash Wednesday</td>
      </tr>
      <tr>
         <td>Mar 7, Tue</td>
         <td>Purim</td>
      </tr>
      <tr>
         <td>Apr 6, Thurs</td>
         <td>Holy Thursday</td>
      </tr>
      <tr>
         <td>Apr 7, Fri</td>
         <td>Good Friday</td>
      </tr>
      <tr>
         <td>Apr 12, Wed</td>
         <td>Passover</td>
      </tr>
      <tr>
         <td>Apr 13, Thurs</td>
         <td>Holy Thursday (Orthodox)</td>
      </tr>
      <tr>
         <td>Apr 14, Friday</td>
         <td>Good Friday (Orthodox)</td>
      </tr>
      <tr>
         <td>Apr 21-Apr 23, Fri-Sun</td>
         <td>Idul-Fitr (Eid al-Fitr)</td>
      </tr>
      <tr>
         <td>May 18, Thurs</td>
         <td>Solemnity of the Ascension</td>
      </tr>
      <tr>
         <td>May 26-27, Fri-Sat</td>
         <td>Shavuot (2 Days)</td>
      </tr>
      <tr>
         <td>May 29, Mon</td>
         <td>Memorial Day</td>
      </tr>
      <tr>
         <td>June 19, Mon</td>
         <td>Juneteenth</td>
      </tr>
      <tr>
         <td>June 28-June 30, Wed-Fri</td>
         <td>Idul-Adha (Eid al-Adha)</td>
      </tr>
      <tr>
         <td>July 4, Tue</td>
         <td>Independence Day</td>
      </tr>
      <tr>
         <td>Aug 15, Tue</td>
         <td>Feast of the Assumption</td>
      </tr>
      <tr>
         <td>Sept 4, Mon</td>
         <td>Labor Day</td>
      </tr>
      <tr>
         <td>Sept 16-17, Sat-Sun</td>
         <td>Rosh Hashanah</td>
      </tr>
      <tr>
         <td>Sept 25, Mon</td>
         <td>Yom Kippur</td>
      </tr>
      <tr>
         <td>Sept 30-Oct 1, Sat-Sun</td>
         <td>Succoth (2 Days)</td>
      </tr>
      <tr>
         <td>Oct 7, Sat</td>
         <td>Shemini Atzereth</td>
      </tr>
      <tr>
         <td>Oct 8, Sun</td>
         <td>Simchas Torah</td>
      </tr>
      <tr>
         <td>Oct 9, Mon</td>
         <td>Italian Heritage Day/Indigenous Peoples' Day</td>
      </tr>
      <tr>
         <td>Nov 1, Wed</td>
         <td>All Saints Day</td>
      </tr>
      <tr>
         <td>Nov 7, Tue</td>
         <td>Election Day</td>
      </tr>
      <tr>
         <td>Nov 10, Fri</td>
         <td>Veterans Day (Observed)</td>
      </tr>
      <tr>
         <td>Nov 11, Sat</td>
         <td>Veterans Day</td>
      </tr>
      <tr>
         <td>Nov 12, Sun</td>
         <td>Diwali</td>
      </tr>
      <tr>
         <td>Nov 23, Thurs</td>
         <td>Thanksgiving Day</td>
      </tr>
      <tr>
         <td>Dec 8, Fri</td>
         <td>Immaculate Conception</td>
      </tr>
      <tr>
         <td>Dec 25, Mon</td>
         <td>Christmas Day</td>
      </tr>
   </tbody>
</table>`
}
