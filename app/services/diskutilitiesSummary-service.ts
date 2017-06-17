
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {DiskutilitiesSummary} from '../model/diskutilitiesSummary-model';
import {AppSettings} from '../settings';
import {Observable} from 'rxjs';

@Injectable()
export class DiskutilitiesSummaryService {
  headers: Headers;

  constructor(public http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getDiskutilitiesSummary (): Observable<DiskutilitiesSummary[]> {
    return this.http.get(AppSettings.MONITORING_DISKUTILITIES_SUMMARY_URL)
      .map(this.extractResponse)
      .catch(this.handleError);
  }
  private extractResponse(res: Response): DiskutilitiesSummary[] {
    let body = res.json();
    return body.diskutilities.map(function (diskutilities: any) {
      const transformeddiskutilities = new DiskutilitiesSummary();
      transformeddiskutilities.Name = diskutilities.Name;
      transformeddiskutilities.Total_Disk_Size = diskutilities.Total_Disk_Size;
      transformeddiskutilities.Disk_In_use = diskutilities.Disk_In_use;
      transformeddiskutilities.Max_Usage = diskutilities.Max_Usage;
      return transformeddiskutilities;
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
