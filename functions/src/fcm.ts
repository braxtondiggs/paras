import * as admin from 'firebase-admin';
import db from './db';
import * as dayjs from 'dayjs';
import * as weekday from 'dayjs/plugin/weekday';
import { isEmpty } from 'lodash';
dayjs.extend(weekday);

const payload: admin.messaging.MessagingPayload = {
  notification: {
    title: 'Alternate Side Parking',
    icon: 'notification_icon',
    color: "#74b9ff"
  }
};
export async function FCM(type?: string, tweet?: any) {
  if (type === 'scrape' && tweet && tweet.date) {
    await getImmediateNotifications(tweet);
  } else {
    await getCustomNotifications();
  }
}

async function getImmediateNotifications(tweet: any) {
  const isToday = dayjs(tweet.date).isSame(dayjs(), 'day');
  const query = await db.collection('notifications').where(isToday ? 'today' : 'nextDay', '==', 'immediately').where('type', '==', 'NYC').get();
  const promise: FirebaseFirestore.QueryDocumentSnapshot[] = [];
  const tokens: string[] = [];
  query.forEach(snapshot => promise.push(snapshot));
  for (const snapshot of promise) {
    const { exceptionOnly, nextDay, today, token, weekend } = snapshot.data();
    if (payload.notification) payload.notification.body = tweet.text;
    if (token && !isEmpty(token) && (today === 'immediately' && isToday) || (nextDay === 'immediately' && !isToday)) {
      if (checkWeekend(weekend, dayjs(tweet.date)) && checkException(exceptionOnly, tweet.active)) {
        tokens.push(token);
      }
    }
  }

  await sendToDevices(tokens, promise);
}

async function getCustomNotifications() {
  const data = await db.collection('feed').orderBy('created', 'desc').limit(1).get();
  let promise: FirebaseFirestore.QueryDocumentSnapshot[] = [];
  data.forEach(snapshot => promise.push(snapshot));
  let isToday = false;
  let isActive = false;
  for (const snapshot of promise) {
    const { date, text } = snapshot.data();
    if (payload.notification) payload.notification.body = text;
    isToday = dayjs(date.toDate()).isSame(dayjs(), 'day');
  }
  promise = []; // reset
  const query = await db.collection('notifications').where(isToday ? 'today' : 'nextDay', '==', 'custom').where('type', '==', 'NYC').get();
  const tokens: string[] = [];
  query.forEach(snapshot => promise.push(snapshot));
  for (const snapshot of promise) {
    const { exceptionOnly, nextDay, nextDayCustom, today, todayCustom, token, weekend } = snapshot.data();
    let date = isToday ? dayjs().format('MM/DD/YYYY') : dayjs().add(1, 'day').format('MM/DD/YYYY');
    date = isToday ? `${date} ${todayCustom}` : `${date} ${nextDayCustom}`;
    isActive = dayjs(date).isAfter(dayjs()) && dayjs(date).isBefore(dayjs().add(15, 'minute'));
    if ((today === 'custom' && isToday && isActive) || (nextDay === 'custom' && !isToday && isActive)) {
      if (token && !isEmpty(token) && checkWeekend(weekend, dayjs(date)) && checkException(exceptionOnly, isActive)) {
        tokens.push(token);
      }
    }
  }

  await sendToDevices(tokens, promise);
}

async function sendToDevices(tokens: string[], promise: FirebaseFirestore.QueryDocumentSnapshot[]) {
  if (tokens.length <= 0) return;
  console.log(`There are ${promise.length} tokens to send notifications to.`);
  const response = await admin.messaging().sendToDevice(tokens, payload);  // Limit to 500 devices, will need to optimize later
  const deadTokens: Promise<FirebaseFirestore.WriteResult>[] = [];
  response.results.forEach((result, index) => {
    const error = result.error;
    if (error) {
      console.error('Failure sending notification to', tokens[index], error); // Cleanup the tokens who are not registered anymore.
      if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
        deadTokens.push(promise[index].ref.delete());
      }
    }
  });
  if (deadTokens.length <= 0) return;
  return Promise.all(deadTokens);
}

function checkWeekend(weekend: boolean, date: dayjs.Dayjs): boolean {
  return weekend || (date.weekday() !== 6 || date.weekday() !== 0)
}

function checkException(value: boolean, active: any): boolean {
  return !value || (value && active);
}
