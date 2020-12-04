import db from './db';
import * as dayjs from 'dayjs';
import * as cheerio from 'cheerio';
import { toNumber, replace, split } from 'lodash';

export async function getNYCalender(): Promise<any> {
  // const uri = 'https://www1.nyc.gov/html/dot/html/motorist/alternate-side-parking.shtml';
  const year = 2021;
  const $: cheerio.Root = cheerio.load(getHTML());
  const promise: Promise<FirebaseFirestore.WriteResult>[] = [];
  $('table tbody tr').each((_, tr) => {
    const data: string[] = [];
    $('td', tr).each((__, td) => data.push($(td).text()));
    if (data[0].includes('-')) {
      const date = split(data[0], ', ')[1];
      const range = split(date, '-');
      const start = dayjs(range[0]).year(year).toDate()
      const end = range[1].length <= 2 ? dayjs(start).set('date', toNumber(range[1])).year(year).toDate() : dayjs(range[1]).year(year).toDate();
      const rangeArr = getDaysArray(start, end);
      rangeArr.forEach((value) => {
        const id = dayjs(value).format('MMDDYYYY');
        promise.push(db.doc(`feed/${id}`).set(convertData(id, dayjs(value), data[1])));
      });
    } else {
      const id = dayjs(data[0]).year(year).format('MMDDYYYY');
      promise.push(db.doc(`feed/${id}`).set(convertData(id, dayjs(data[0]).year(year), data[1])));
    }
  });
  return Promise.all(promise);
}

function getDaysArray(start: Date, end: Date) {
  let arr,
    dt: Date;
  // tslint:disable-next-line: ban-comma-operator
  for (arr = [], dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr;
};

function convertData(id: string, date: dayjs.Dayjs, text: string) {
  return {
    active: false,
    created: dayjs().toDate(),
    date: date.toDate(),
    id,
    metered: true,
    text: `Rules are suspended today, ${date.format('MMMM D')}.`,
    reason: replace(text, '*', ''),
    type: 'NYC'
  };
}

function getHTML() {
  return `<table class="tabular-list table-striped" cellspacing="0" cellpadding="0" border="0" summary="Table of 2021 Alternate Side Parking Suspensions">
  <colgroup>
     <col width="43%">
     <col width="57%">
  </colgroup>
  <thead>
     <tr>
        <td width="324" id="t1"><strong>Date</strong></td>
        <td width="194" id="t2"><strong>Holiday</strong></td>
     </tr>
  </thead>
  <tbody>
     <tr>
        <td>Friday, January 1</td>
        <td>New Year's Day</td>
     </tr>
     <tr>
        <td>Wednesday, January 6</td>
        <td>Three Kings' Day</td>
     </tr>
     <tr>
        <td>Monday January 18</td>
        <td>Martin Luther King, Jr.'s Birthday</td>
     </tr>
     <tr>
        <td>Thursday, February 11</td>
        <td>Lunar New Year's Eve</td>
     </tr>
     <tr>
        <td>Friday, February 12</td>
        <td>Lunar New Year</td>
     </tr>
     <tr>
        <td>Friday, February 12</td>
        <td>Lincoln's Birthday</td>
     </tr>
     <tr>
        <td>Monday, February 15</td>
        <td>Washington's Birthday (President's Day)</td>
     </tr>
     <tr>
        <td>Wednesday, February 17</td>
        <td>Ash Wednesday</td>
     </tr>
     <tr>
        <td>Friday, February 26</td>
        <td>Purim</td>
     </tr>
     <tr>
        <td>Sunday-Monday, March 28-29</td>
        <td>Passover (1st/2nd Days)</td>
     </tr>
     <tr>
        <td>Thursday, April 1</td>
        <td>Holy Thursday</td>
     </tr>
     <tr>
        <td>Friday, April 2</td>
        <td>Good Friday</td>
     </tr>
     <tr>
        <td>Saturday-Sunday, April 3-4</td>
        <td>Passover (7th/8th Days)</td>
     </tr>
     <tr>
        <td>Thursday, April 29</td>
        <td>Holy Thursday (Orthodox)</td>
     </tr>
     <tr>
        <td>Friday, April 30</td>
        <td>Good Friday (Orthodox)</td>
     </tr>
     <tr>
        <td>Thursday-Saturday, May 13-15</td>
        <td>Idul-Fitr (Eid Al-Fitr)</td>
     </tr>
     <tr>
        <td>Thursday, May 13</td>
        <td>Solemnity of the Ascension</td>
     </tr>
     <tr>
        <td>Monday-Tuesday, May 17-18</td>
        <td>Shavuot (2 Days)</td>
     </tr>
     <tr>
        <td>Monday, May 31</td>
        <td>Memorial Day*</td>
     </tr>
     <tr>
        <td>Saturday, June 19</td>
        <td>Juneteenth</td>
     </tr>
     <tr>
        <td>Sunday-Monday, July 4-5</td>
        <td>Independence Day</td>
     </tr>
     <tr>
        <td>Monday-Wednesday, July 19-21</td>
        <td>Idul-Adha (Eid Al-Adha)</td>
     </tr>
     <tr>
        <td>Sunday, August 15</td>
        <td>Feast of the Assumption</td>
     </tr>
     <tr>
        <td>Monday, September 6</td>
        <td>Labor Day</td>
     </tr>
     <tr>
        <td>Tuesday-Wednesday, September 7-8</td>
        <td>Rosh Hashanah</td>
     </tr>
     <tr>
        <td>Thursday, September 16</td>
        <td>Yom Kippur</td>
     </tr>
     <tr>
        <td>Tuesday-Wednesday, September 21-22</td>
        <td>Succoth (2 Days)</td>
     </tr>
     <tr>
        <td>Tuesday, September 28</td>
        <td>Shemini Atzereth</td>
     </tr>
     <tr>
        <td>Wednesday, September 29</td>
        <td>Simchas Torah</td>
     </tr>
     <tr>
        <td>Monday, October 11</td>
        <td>Columbus Day</td>
     </tr>
     <tr>
        <td>Monday, November 1</td>
        <td>All Saints' Day</td>
     </tr>
     <tr>
        <td>Tuesday, November 2</td>
        <td>Election Day</td>
     </tr>
     <tr>
        <td>Thursday, November 4</td>
        <td>Diwali</td>
     </tr>
     <tr>
        <td>Thursday, November 11</td>
        <td>Veteran’s Day</td>
     </tr>
     <tr>
        <td>Thursday, November 25</td>
        <td>Thanksgiving Day</td>
     </tr>
     <tr>
        <td>Wednesday December 8 </td>
        <td>Immaculate Conception</td>
     </tr>
     <tr>
        <td>Friday-Saturday, December 24-25</td>
        <td>Christmas Day</td>
     </tr>
     <tr>
        <td>Friday-Saturday, December 31-January 1</td>
        <td>New Year's Day (2022)</td>
     </tr>
  </tbody>
</table>`
}
