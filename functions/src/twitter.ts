import * as dayjs from 'dayjs';
import db from './db';
import * as functions from 'firebase-functions';
import { isNull, isUndefined, replace, upperFirst } from 'lodash';
import * as Twitter from 'twitter';
import { FCM } from './fcm';
import axios from 'axios';
import * as timezone from 'dayjs/plugin/timezone';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.tz.setDefault('America/New_York');

const Sherlock = require('sherlockjs');
const client = new Twitter({
  consumer_key: 'ooP4LLRRJ51r454e3j7bVHc04',
  consumer_secret: '6YBjrkeOSiEbCiqGe9H9POpxcMGdfyXfYlJvB1CUrjm8lv1Ayo',
  access_token_key: '3066146602-XcmevyJ6a9x5WxyXljsOqV7j7fEMTmTa0yKtLU4',
  access_token_secret: 'E8n1eJgnKrTHQrZ6NToaYiewHRWE0c1DT7HxYixa2jnYh'
});

export async function getNYFeed(_request: functions.Request, response: functions.Response): Promise<any> {
  const tweets = await client.get('statuses/user_timeline', { screen_name: 'NYCASP', count: 1 });
  const promise: any[] = [];
  const ID = dayjs().get('hour') <= 12 ? 'e6cbd04c-ae72-4670-820a-9a5a89148f53' : 'c8851266-e255-4e0a-bafa-1fd85863b0c2';
  let data;
  tweets.forEach(async (tweet: Twitter.ResponseData) => {
    const active = isActive(tweet.text);
    const dates = getDate(tweet.text);
    const metered = isMetered(tweet.text.toLowerCase());
    if (!isUndefined(dates) && !isNull(active)) {
      dates.forEach((date, index) => {
        const id = index === 0 ? tweet.id : `${tweet.id}-${index}`;

        data = {
          active,
          created: dayjs(tweet.created_at).toDate(),
          date: dayjs(date).add(5, 'h').toDate(), // UTC
          id: tweet.id,
          metered,
          reason: getReason(tweet.text),
          text: formatText(tweet.text),
          type: 'NYC'
        };
        promise.push(db.doc(`feed/${id}`).set(data));
      });
    }
  });
  await Promise.all(promise);
  await FCM('scrape', data);
  await axios.get(`https://hc-ping.com/${ID}`);
  return response.status(200).send('Ok');
}

export async function getTweetReplies(request: functions.https.Request, response: functions.Response) {
  const params = request.url.split('/');
  const tweets = await client.get('search/tweets', { since_id: params[1], q: 'to:@NYCASP', count: 100, max_id: null });
  return response.send(tweets.statuses); // .filter((tweet: any) => tweet.in_reply_to_status_id_str === params[1].toString()));
}

function getDate(text: string): Date[] | undefined {
  const sherlocked = Sherlock.parse(text);
  if (isNull(sherlocked.startDate) && isNull(sherlocked.endDate)) return;
  if (isNull(sherlocked.endDate)) return [sherlocked.startDate];
  return getDaysArray(sherlocked.startDate, sherlocked.endDate);
}

function isActive(text: string): boolean | null {
  const neg = text.indexOf('rules are suspended') !== -1 || text.indexOf('rules will be suspended') !== -1;
  const pos = text.indexOf('rules will be in effect') !== -1 || text.indexOf('rules are in effect today') !== -1;
  return neg || pos ? pos : null;
}

function isMetered(text: string): boolean {
  const neg = text.indexOf('parking meters are not in effect') !== -1 || text.indexOf('parking meters will not be in effect') !== -1;
  const pos = text.indexOf('parking meters will remain in effect') !== -1 || text.indexOf('parking meters are in effect') !== -1;
  return neg || pos ? pos : true;
}

function formatText(text: string): string {
  const output = replace(text, '#NYCASP ', '');
  return upperFirst(output);;
}

function getReason(text: string): string | null {
  let keyword;
  if (text.includes('to ')) keyword = 'to ';
  if (text.includes('for ')) keyword = 'for ';
  if (isUndefined(keyword)) return null;
  
  const output = text.split(keyword).pop()?.split('.');
  return output ? upperFirst(output[0]) : null;
}

function getDaysArray(start: Date, end: Date): Date[] {
  let arr: Date[], dt: Date;
  for (arr = [], dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr;
};
