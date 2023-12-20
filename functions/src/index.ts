import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from "firebase-admin/firestore";
import { getRemoteConfig } from "firebase-admin/remote-config";
import { log, error } from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";

import axios from 'axios';
import dayjs from 'dayjs';

import { getImmediateNotifications, getCustomNotifications } from './fcm';

const _app = initializeApp();
const db = getFirestore();
const config = getRemoteConfig();
db.settings({ ignoreUndefinedProperties: true });

const getASPData = async (from?: string, to?: string) => {
	const fromDate = from ?? dayjs().format('YYYY-MM-DD');
	const toDate = to ?? dayjs().add(1, 'day').format('YYYY-MM-DD');
	log('getASPData', fromDate, toDate);
	const { parameters  } = await config.getTemplate();
	const APIKEY = (parameters.ASPKEY.defaultValue as any).value;
	if (!APIKEY) return error('Missing APIKEY');

	try {
		const { data } = await axios.get<IASPResponse>(`https://api.nyc.gov/public/api/GetCalendar?fromdate=${fromDate}&todate=${toDate}`, {
			headers: {
				'Cache-Control': 'no-cache',
				'Ocp-Apim-Subscription-Key': APIKEY
			}
		});
		
		const batch = db.batch();
		data.days.forEach(({ today_id, items }) => {
			const item = items.find(({ type, reason }) => type === 'Alternate Side Parking' && reason !== 'Information Not Available');
			if (!item) return;
			const { exceptionName, details, status } = item;
			const feedRef = db.doc(`feed/${today_id}`);
			batch.set(feedRef, {
				active: status === Status.Active,
				created: dayjs().toDate(),
				date: dayjs(today_id, 'YYYYMMDD').toDate(),
				id: today_id,
				metered: isMetered(details),
				reason: exceptionName || getReason(details),
				text: details,
				type: 'NYC'
			});
		});
		await batch.commit()
	} catch (err) {
		error(err);
	}
};

const getASPMonth = async () => {
	log('getASPMonth');
	const dates = Array.from({ length: 7 }, (_, i) => {
		const start = dayjs().add(i * 2, 'month').startOf('month').format('YYYY-MM-DD');
		const end = dayjs(start).add(2, 'month').subtract(1, 'day').endOf('month').format('YYYY-MM-DD');
		return { start, end };
	});
	for (const { start, end } of dates) {
		await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds between requests
		await getASPData(start, end);
	}
};

function isMetered(text: string): boolean {
	const neg = text.indexOf('meters are not in effect') !== -1 || text.indexOf('meters will not be in effect') !== -1;
	const pos = text.indexOf('meters will remain in effect') !== -1 || text.indexOf('meters are in effect') !== -1;
	return neg || pos ? pos : true;
}

function getReason(text: string): string | undefined {
	let keyword;
	if (text.includes('to ')) keyword = 'to ';
	if (text.includes('for ')) keyword = 'for ';
	if (text.includes('on ')) keyword = 'on ';
	if (typeof keyword === 'undefined') return keyword;
  
	const output = text.split(keyword).pop()?.split('.');
	if (!output) return;
	return upperFirst(output[0]);
}

const upperFirst = (text: string) => {
	return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

onSchedule('every 4 hours', async () => await getASPData())
onSchedule('every 1 month', async () => await getASPMonth())
onSchedule('every 15 minutes', async () => await getCustomNotifications(db))
onSchedule('30 7 * * *', async () => await getImmediateNotifications(db, 'today'));
onSchedule('0 16 * * *', async () => await getImmediateNotifications(db, 'nextDay'));
/*exports.playground = onRequest(async (req, res) => {
	await sendNotifications();
	res.send('OK');
})*/

enum Status {
	Suspended = 'SUSPENDED',
	Active = 'IN EFFECT'
}

interface IASPResponse {
	days: {
		today_id: string;
		items: {
			type: string;
			exceptionName?: string;
			details: string;
			status: Status;
			reason?: string;
		}[];
	}[];
}
