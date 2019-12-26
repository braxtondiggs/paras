import * as admin from 'firebase-admin';
import db from './db';
import * as dayjs from 'dayjs';

const payload: admin.messaging.MessagingPayload = {
  data: {
    title: 'Something Goes Here',
    body: 'Body goes here'
  }
}
export async function FCM(type?: string, tweet?: any) {
  if (type === 'scrape' && tweet && tweet.date) {
    await getImmediateNotifications(tweet);
  } else {
    // await getCustomNotifications();
  }
}

async function getImmediateNotifications(tweet: any) {
  const isToday = dayjs(tweet.date).isSame(dayjs(), 'day');
  const query = await db.collection('notifications').where(isToday ? 'today' : 'nextDay', '==', 'immediately').get();
  const promise: any = [];
  const registrationTokens: string[] = [];
  query.forEach(snapshot => promise.push(snapshot));
  for (const snapshot of promise) {
    const { nextDay, today, token } = snapshot.data();
    if ((today === 'immediately' && isToday) || (nextDay === 'immediately' && !isToday)) {
      registrationTokens.push(token);
    }
  }
  await admin.messaging().sendToDevice(registrationTokens, payload); // Limit to 500 devices, will need to optimize later
}

/*async function getCustomNotifications() {
  const data = await db.collection('feed').orderBy('created', 'desc').limit(1).get();
  const promise: any = [];
  data.forEach(snapshot => promise.push(snapshot));
  let isToday = false;
  for (const snapshot of promise) {
    isToday = dayjs(snapshot.date).isSame(dayjs(), 'day');
  }
  const query = await db.collection('notifications').where(isToday ? 'today' : 'nextDay', '==', 'custom').get();
}*/
