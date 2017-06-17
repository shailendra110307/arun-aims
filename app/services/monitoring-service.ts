import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {MonitoringGraph} from '../model/monitoringGraph-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class MonitoringGraphService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }
  getMonitoringData (): Observable<MonitoringGraph> {
    return this.http.get(AppSettings.MONITORING_DATA_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }

  private extractResponse(res: Response): MonitoringGraph {
    return <MonitoringGraph>res.json();
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
