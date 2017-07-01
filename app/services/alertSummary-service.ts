/**
 * Created by Rini Daniel on 1/17/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {AlertSummary} from '../model/alertSummary-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class AlertSummaryService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getOverallAlertSummary (): Observable<AlertSummary[]> {
    return this.http.get(AppSettings.OVERALL_DATA_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }  
  
  getServerAlertSummary (): Observable<AlertSummary[]> {
    return this.http.get(AppSettings.SERVER_DATA_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }
  
  getApplicationAlertSummary (): Observable<AlertSummary[]> {
    return this.http.get(AppSettings.APPLICATION_DATA_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }
  
  private extractResponse(res: Response): AlertSummary[] {
    let body = res.json();
    return body;
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
