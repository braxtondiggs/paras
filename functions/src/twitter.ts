import * as dayjs from 'dayjs';
import db from './db';
import * as functions from 'firebase-functions';
import { findIndex, isNull, intersection, range, replace, upperFirst } from 'lodash';
import * as Twitter from 'twitter';
import { FCM } from './fcm';

const client = new Twitter({
  consumer_key: 'ooP4LLRRJ51r454e3j7bVHc04',
  consumer_secret: '6YBjrkeOSiEbCiqGe9H9POpxcMGdfyXfYlJvB1CUrjm8lv1Ayo',
  access_token_key: '3066146602-XcmevyJ6a9x5WxyXljsOqV7j7fEMTmTa0yKtLU4',
  access_token_secret: 'E8n1eJgnKrTHQrZ6NToaYiewHRWE0c1DT7HxYixa2jnYh'
});

export async function getNYFeed(_request: functions.https.Request, response: functions.Response) {
  const tweets = await client.get('statuses/user_timeline', { screen_name: 'NYCASP', count: 1 });
  const promise: any[] = [];
  let data;
  tweets.forEach(async (tweet: Twitter.ResponseData) => {
    const active = isActive(tweet.text);
    const date = getDate(tweet.text);
    const metered = isMetered(tweet.text.toLowerCase());
    if (!isNull(date) && !isNull(active)) {
      data = {
        active,
        created: dayjs(tweet.created_at).toDate(),
        date,
        id: tweet.id,
        metered,
        reason: getReason(tweet.text),
        text: formatText(tweet.text),
        type: 'NYC'
      };
      promise.push(db.doc(`feed/${tweet.id}`).set(data));
    }
  });
  await Promise.all(promise);
  await FCM('scrape', data);
  return response.status(200).send('Ok');
}

export async function getTweetReplies(request: functions.https.Request, response: functions.Response) {
  const params = request.url.split('/');
  const tweets = await client.get('search/tweets', { since_id: params[1], q: 'to:@NYCASP', count: 100, max_id: null });
  return response.send(tweets.statuses); // .filter((tweet: any) => tweet.in_reply_to_status_id_str === params[1].toString()));
}

function getDate(text: string): Date | null {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = range(1, 32).map(v => v.toString());
  const month = findIndex(months, v => text.indexOf(v) !== -1);
  const day = intersection(days, text.match(/(\d+)/g) as Array<String>);
  const year = dayjs().year();
  const time = `${dayjs().hour()}:${dayjs().minute()}:${dayjs().second()}`;
  return day.length > 0 && month !== -1 ? dayjs(`${month + 1}-${day[0]}-${year} ${time}`).toDate() : null;
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
  let output = replace(text, '#NYCASP ', '');
  output = upperFirst(output);
  return output;
}

function getReason(text: string): string | null {
  const output = text.split('for ').pop()?.split('.');
  return output && text.includes('for ') ? upperFirst(output[0]) : null;
}
