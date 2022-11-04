import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { traceUntilFirst } from '@angular/fire/performance';
import dayjs from 'dayjs';
import { FeedService } from 'app/core/services';

@Component({
  selector: 'app-twitter-comments',
  templateUrl: './twitter-comments.component.html'
})
export class TwitterCommentsComponent implements OnInit {
  @Input() date?: Date;
  start = dayjs(this.date).set('hour', 0).set('minute', 0).subtract(3, 'hour');
  end = dayjs(this.date).set('hour', 23).set('minute', 59).subtract(3, 'hour');
  comments$?: Observable<Observable<Comment[]>>;

  constructor(private feed: FeedService, private http: HttpClient) {}

  ngOnInit(): void {
    this.comments$ = this.feed.get(this.start, this.end).pipe(traceUntilFirst('getComments'), take(1), map(feed => {
      const item = feed[0];
      if (!item) return of([]);
      return this.http.get<Comment[]>(`https://us-central1-paras-293d5.cloudfunctions.net/endpoints/nyc/comments/1493329454915018758${item.id}`);
    }));
  }
}

interface Comment {
  name: String;
  text: String;
  image: String;
}
