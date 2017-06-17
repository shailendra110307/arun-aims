/**
 * Created by Rini Daniel on 1/17/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {EventSummary} from '../model/eventSummary-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class EventSummaryService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getEventSummary (): Observable<EventSummary[]> {
    return this.http.get(AppSettings.MONITORING_EVENT_SUMMARY_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }


  private extractResponse(res: Response): EventSummary[] {
    let body = res.json();
    return body.events.map(function (event: any) {
      const transformedEvent = new EventSummary();
      transformedEvent.ip_address = event.ip_address;
      transformedEvent.Message = event.Message;
      transformedEvent.time = event.time;
      transformedEvent.eventtype = event.eventtype;
      return transformedEvent;
    });
  }
  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
