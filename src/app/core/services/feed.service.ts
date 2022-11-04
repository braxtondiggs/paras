import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { traceUntilFirst } from '@angular/fire/performance';
import { collection, collectionData, CollectionReference, Firestore, limit, orderBy, query, where } from '@angular/fire/firestore';
import { Dayjs } from 'dayjs';
import { Feed } from '../interface';

@Injectable({
	providedIn: 'root'
})
export class FeedService {
	constructor(private afs: Firestore) { }

	get(start: Dayjs, end: Dayjs): Observable<Feed[]> {
		return collectionData<Feed>(
			query<Feed>(
				collection(this.afs, 'feed') as CollectionReference<Feed>,
				where('date', '>=', start.toDate()),
				where('date', '<', end.toDate()),
				where('type', '==', 'NYC')
			),
			{ idField: 'id' }
		).pipe(
			traceUntilFirst('getFeed'),
			map((item: Feed[]) => item.filter(o => !o.active || !o.metered))
		);
	}

	getLast(): Observable<Feed[]> { // Firestore.instance.collection("data").snapshots().last
		return collectionData<Feed>(
			query<Feed>(
				collection(this.afs, 'feed') as CollectionReference<Feed>,
				limit(1),
				orderBy('date', 'desc')
			),
			{ idField: 'id' }
		).pipe(traceUntilFirst('getLastFeedItem'), take(1));
	}
}