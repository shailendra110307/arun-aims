/**
 * Created on 5/23/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {ApplicationsettingsInfo} from '../model/applicationsettingsInfo-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class ApplicationsettingsInfoService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getApplicationsettingsInfo (): Observable<ApplicationsettingsInfo[]> {
    return this.http.get(AppSettings.MONITORING_APPLICATIONSETTINGS_INFO_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }
 

  private extractResponse(res: Response): ApplicationsettingsInfo[] {
    let body = res.json();
    return body.applicationsettingss.map(function (applicationsettings: any) {
      const transformedApplicationsettings = new ApplicationsettingsInfo();
      transformedApplicationsettings.cpu_low_threshold = applicationsettings.cpu_low_threshold;
      transformedApplicationsettings.replication_count = applicationsettings.replication_count;
      transformedApplicationsettings.cpu_high_threshold = applicationsettings.cpu_high_threshold;
      transformedApplicationsettings.replicaton_count = applicationsettings.replicaton_count;
      return transformedApplicationsettings;
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
