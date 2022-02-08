import db from './db';
import * as functions from 'firebase-functions';
import * as dayjs from 'dayjs';
import * as cheerio from 'cheerio';
import { toNumber, replace, split } from 'lodash';
import * as timezone from 'dayjs/plugin/timezone';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.tz.setDefault('America/New_York');

export async function getNYCalender(_request: functions.Request, response: functions.Response) {
   // const uri = 'https://www1.nyc.gov/html/dot/html/motorist/alternate-side-parking.shtml';
   const year = 2022;
   const $ = cheerio.load(getHTML());
   const promise: Promise<FirebaseFirestore.WriteResult>[] = [];
   $('table tbody tr').each((_: any, tr: any) => {
      const data: string[] = [];
      $('td', tr).each((__: any, td: any) => { data.push($(td).text()) });
      if (!data.length) return;
      if (data[0].includes('-')) {
         const date = split(data[0], ', ')[0];
         const range = split(date, '-');
         const start = dayjs(range[0], 'MMM D').year(year).toDate()
         const end = range[1].length <= 2 ? dayjs(start).set('date', toNumber(range[1])).year(year).toDate() : dayjs(range[1]).year(year).toDate();
         const rangeArr = getDaysArray(start, end);
         rangeArr.forEach((value) => {
            const id = dayjs(value).format('MMDDYYYY');
            promise.push(db.doc(`feed/${id}`).set(convertData(id, dayjs(value), data[1])));
         });
      } else {
         const id = dayjs(data[0], 'MMM D').year(year).format('MMDDYYYY');
         promise.push(db.doc(`feed/${id}`).set(convertData(id, dayjs(data[0], 'MMM D').year(year), data[1])));
      }
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
};

function convertData(id: string, date: dayjs.Dayjs, text: string) {
   return {
      active: false,
      created: dayjs().toDate(),
      date: date.hour(12).minute(0).second(0).toDate(),
      id,
      metered: true,
      text: `Rules are suspended today, ${date.format('MMMM D')}.`,
      reason: replace(text, '*', ''),
      type: 'NYC'
   };
}

function getHTML() {
   return `<table class="tg">
  <tbody>
     <tr>
        <th class="header">Date</th>
        <th class="header">Holiday</th>
     </tr>
     <tr>
        <td>Jan 1, Sat</td>
        <td>New Year's Day</td>
     </tr>
     <tr>
        <td>Jan 6, Thurs</td>
        <td>Three Kings' Day</td>
     </tr>
     <tr>
        <td>Jan 17, Mon</td>
        <td>Martin Luther King, Jr. Day</td>
     </tr>
     <tr>
        <td>Jan 31 - Feb 1, Mon-Tue</td>
        <td>Lunar New Year's Eve &amp; Lunar New Year</td>
     </tr>
     <tr>
        <td>Feb 12, Sat</td>
        <td>Lincoln's Birthday</td>
     </tr>
     <tr>
        <td>Feb 21, Mon</td>
        <td>Washington's Birthday (Pres. Day)</td>
     </tr>
     <tr>
        <td>Mar 2, Wed</td>
        <td>Ash Wednesday</td>
     </tr>
     <tr>
        <td>Mar 17, Thurs</td>
        <td>Purim</td>
     </tr>
     <tr>
        <td>Apr 14, Thurs</td>
        <td>Holy Thursday</td>
     </tr>
     <tr>
        <td>Apr 15, Fri</td>
        <td>Good Friday</td>
     </tr>
     <tr>
        <td>Apr 16, Sat</td>
        <td>Passover</td>
     </tr>
     <tr>
        <td>Apr 21, Thurs</td>
        <td>Holy Thursday (Orthodox)</td>
     </tr>
     <tr>
        <td>Apr 22, Friday</td>
        <td>Passover (7th Day) and Good Friday (Orthodox)</td>
     </tr>
     <tr>
        <td>Apr 23, Sat</td>
        <td>Passover (8th Day)</td>
     </tr>
     <tr>
        <td>May 2-4, Mon-Wed</td>
        <td>Idul-Fitr (Eid al-Fitr)</td>
     </tr>
     <tr>
        <td>May 26, Thurs</td>
        <td>Solemnity of the Ascension</td>
     </tr>
     <tr>
        <td>May 30, Mon</td>
        <td>Memorial Day</td>
     </tr>
     <tr>
        <td>Jun 6, Mon</td>
        <td>Shavuot</td>
     </tr>
     <tr>
        <td>Jun 20, Mon</td>
        <td>Juneteenth</td>
     </tr>
     <tr>
        <td>Jul 4, Mon</td>
        <td>Independence Day</td>
     </tr>
     <tr>
        <td>Jul 9-Jul 11, Sat-Mon</td>
        <td>Idul-Adha (Eid al-Adha)</td>
     </tr>
     <tr>
        <td>Aug 15, Mon</td>
        <td>Feast of the Assumption</td>
     </tr>
     <tr>
        <td>Sep 5, Mon</td>
        <td>Labor Day</td>
     </tr>
     <tr>
        <td>Sep 26-27, Mon-Tue</td>
        <td>Rosh Hashanah</td>
     </tr>
     <tr>
        <td>Oct 5, Wed</td>
        <td>Yom Kippur</td>
     </tr>
     <tr>
        <td>Oct 10, Mon</td>
        <td>Italian Heritage Day/Indigenous Peoples' Day and Succoth (1st Day)</td>
     </tr>
     <tr>
        <td>Oct 11, Tue</td>
        <td>Succoth (2nd Day)</td>
     </tr>
     <tr>
        <td>Oct 17, Mon</td>
        <td>Shemini Atzereth</td>
     </tr>
     <tr>
        <td>Oct 18, Tue</td>
        <td>Simchas Torah</td>
     </tr>
     <tr>
        <td>Oct 24, Mon</td>
        <td>Diwali</td>
     </tr>
     <tr>
        <td>Nov 1, Tue</td>
        <td>All Saints Day</td>
     </tr>
     <tr>
        <td>Nov 8, Tue</td>
        <td>Election Day</td>
     </tr>
     <tr>
        <td>Nov 11, Fri</td>
        <td>Veterans Day</td>
     </tr>
     <tr>
        <td>Nov 24, Thurs</td>
        <td>Thanksgiving Day</td>
     </tr>
     <tr>
        <td>Dec 8, Thurs</td>
        <td>Immaculate Conception</td>
     </tr>
     <tr>
        <td>Dec 26, Mon</td>
        <td>Christmas Day (Observed)</td>
     </tr>
  </tbody>
</table>`
}
