
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {ProcessdetailsInfo} from '../model/processdetailsInfo-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class ProcessdetailsInfoService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getProcessdetailsInfo (): Observable<ProcessdetailsInfo[]> {
    return this.http.get(AppSettings.MONITORING_PROCESSDETAILS_INFO_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }
 

  private extractResponse(res: Response): ProcessdetailsInfo[] {
    let body = res.json();
    return body.processdetailss.map(function (processdetails: any) {
      const transformedprocessdetails = new ProcessdetailsInfo();
      transformedprocessdetails.total = processdetails.total;
      transformedprocessdetails.java = processdetails.java;
      transformedprocessdetails.snmp = processdetails.snmp;
      transformedprocessdetails.cronjob = processdetails.cronjob;
      transformedprocessdetails.rsyslogd_8 = processdetails.rsyslogd_8;
      return transformedprocessdetails;
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
