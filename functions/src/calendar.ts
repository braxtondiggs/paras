import db from './db';
import * as dayjs from 'dayjs';
import * as rq from 'request-promise';
import * as cheerio from 'cheerio';
import { toNumber, replace, split } from 'lodash';

export async function getNYCalender() {
  const uri = 'https://www1.nyc.gov/html/dot/html/motorist/alternate-side-parking.shtml';
  const $: CheerioStatic = await rq({ uri, transform: (body) => cheerio.load(body) });
  const promise: Promise<FirebaseFirestore.WriteResult>[] = [];
  $('table tbody tr').each((_, tr) => {
    const data: string[] = [];
    $('td', tr).each((__, td) => data.push($(td).text()));
    if (data[0].includes('-')) {
      const date = split(data[0], ', ')[1];
      const range = split(date, '-');
      const start = dayjs(range[0]).year(dayjs().year()).toDate()
      const end = range[1].length <= 2 ? dayjs(start).set('date', toNumber(range[1])).year(dayjs().year()).toDate() : dayjs(range[1]).year(dayjs().year()).toDate();
      const rangeArr = getDaysArray(start, end);
      rangeArr.forEach((value) => {
        const id = dayjs(value).format('MMDDYYYY');
        promise.push(db.doc(`feed/${id}`).set(convertData(id, dayjs(value), data[1])));
      });
    } else {
      const id = dayjs(data[0]).year(dayjs().year()).format('MMDDYYYY');
      promise.push(db.doc(`feed/${id}`).set(convertData(id, dayjs(data[0]), data[1])));
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
