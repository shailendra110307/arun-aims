/**
 * Created on 5/23/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {ServerinfoSummary} from '../model/serverinfoSummary-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class ServerinfoSummaryService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getServerinfoSummary (): Observable<ServerinfoSummary[]> {
    return this.http.get(AppSettings.MONITORING_SERVERINFO_SUMMARY_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }
 

  private extractResponse(res: Response): ServerinfoSummary[] {
    let body = res.json();
    return body.serverinfos.map(function (serverinfo: any) {
      const transformedserverinfo = new ServerinfoSummary();
      transformedserverinfo.node = serverinfo.node;
      transformedserverinfo.public_ip = serverinfo.public_ip;
      transformedserverinfo.private_ip = serverinfo.private_ip;
      transformedserverinfo.fqdn = serverinfo.fqdn;
      transformedserverinfo.domain_name = serverinfo.domain_name;
      transformedserverinfo.operating_system = serverinfo.operating_system;
      transformedserverinfo.data_center = serverinfo.data_center;
      transformedserverinfo.provider = serverinfo.provider;
      transformedserverinfo.project = serverinfo.project;
      transformedserverinfo.role = serverinfo.role;
      return transformedserverinfo;
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
