/**
 * Created on 5/23/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {ContainerSummary} from '../model/containerSummary-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class ContainerSummaryService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getContainerSummary (): Observable<ContainerSummary[]> {
    return this.http.get(AppSettings.MONITORING_CONTAINER_SUMMARY_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }
 

  private extractResponse(res: Response): ContainerSummary[] {
    let body = res.json();
    return body.containers.map(function (container: any) {
      const transformedContainer = new ContainerSummary();
      transformedContainer.application = container.application;
      transformedContainer.id = container.id;
      transformedContainer.host = container.host;
      transformedContainer.ip_address = container.ip_address;
      transformedContainer.usage = container.usage;
      transformedContainer.status = container.status;
       transformedContainer.last_updated = container.last_updated;
      transformedContainer.up_time = container.up_time;
      return transformedContainer;
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
