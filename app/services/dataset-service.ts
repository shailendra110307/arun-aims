import { Injectable } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Http, Headers, Response } from '@angular/http';
import * as _ from 'lodash';

import { AppSettings } from '../settings';

// import { Dataset } from "./dataset";

@Injectable()
export class DatasetService {
    private dataStore: any;
    private _lineDataset = new BehaviorSubject<any[]>(null);// any => class/interface Dataset
    private _lineResponseTimeDataset = new BehaviorSubject<any[]>(null);// any => class/interface Dataset
    private _barDataset = new BehaviorSubject<any[]>(null);// any => class/interface Dataset
    private _areaDataset = new BehaviorSubject<any[]>(null);// any => class/interface Dataset
    private _areaRequestpervmDataset = new BehaviorSubject<any[]>(null);// any => class/interface Dataset
    private _statusPieData = new BehaviorSubject<any>(null);// any => class/interface Dataset
    private _providerPieData = new BehaviorSubject<any>(null);// any => class/interface Dataset
    private _topologyDataset = new BehaviorSubject<any>(null);// any => class/interface Dataset
    private _topologyTreeDataset = new BehaviorSubject<any>(null);// any => class/interface Dataset

    get lineDataset(): Observable<object[]> {
        return this._lineDataset.asObservable();
    }
    get lineResponseTimeDataset(): Observable<object[]> {
        return this._lineResponseTimeDataset.asObservable();
    }
    get barDataset(): Observable<object[]> {
        return this._barDataset.asObservable();
    }
    get areaDataset(): Observable<object[]> {
        return this._areaDataset.asObservable();
    }
    get areaRequestpervmDataset(): Observable<object[]> {
        return this._areaRequestpervmDataset.asObservable();
    }
    get statusPieData(): Observable<object[]> {
        return this._statusPieData.asObservable();
    }
    get providerPieData(): Observable<object[]> {
        return this._providerPieData.asObservable();
    }
    get topologyDataset(): Observable<object[]> {
        return this._topologyDataset.asObservable();
    }
    get topologyTreeDataset(): Observable<object[]> {
        return this._topologyTreeDataset.asObservable();
    }
    headers: Headers;

    constructor(public http: Http) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.dataStore = {
            lineDataset: null,
            lineResponseTimeDataset: null,
            areaRequestpervmDataset: null,
            barDataSet: null,
            areaDataSet: null,
            statusPieData: null,
            providerPieData: null,
            topologyDataset: null,
            topologyTreeDataset: null
        };
    }

    public getRandomInt(min: number, max: number): any {
        return Math.floor(Math.random() * (max - min)) + min;
    }
   

    public getServiceData(): void {
        this.http.get(AppSettings.DATA_SET_MOCK)
            .map(this.extractResponse)
            .catch(this.handleError)
            .subscribe((data) => {
                this.dataStore.lineDataset = data.networkTraffic;
                this.dataStore.lineResponseTimeDataset = data.responseTime;
                this.dataStore.areaRequestpervmDataset = data.requestpervm;
                this.dataStore.barDataset = data.memorySize;
                this.dataStore.areaDataset = data.memorySize;
                this._lineDataset.next(this.dataStore.lineDataset);
                this._lineResponseTimeDataset.next(this.dataStore.lineResponseTimeDataset);
                this._barDataset.next(this.dataStore.barDataset);
                this._areaDataset.next(this.dataStore.areaDataset);
                this._areaRequestpervmDataset.next(this.dataStore.areaRequestpervmDataset);
            });

        this.http.get(AppSettings.DATA_TOPO_MOCK)
            .map(this.extractTopoResponse)
            .catch(this.handleError)
            .subscribe((data) => {
                this.dataStore.topologyDataset = data.network || {};
                this._topologyDataset.next(this.dataStore.topologyDataset);
            });

         this.http.get(AppSettings.DATA_TOPO_TREE_MOCK)
            .map(this.extractTopoTreeResponse)
            .catch(this.handleError)
            .subscribe((data) => {
                this.dataStore.topologyTreeDataset = data || {};
                this._topologyTreeDataset.next(this.dataStore.topologyTreeDataset);
            });

        this.http.get(AppSettings.PIE_DATA_MOCK)
            .map(this.extractPieResponse)
            .catch(this.handleError)
            .subscribe((data) => {
                this.dataStore.statusPieData = data.statusPie || [];
                this.dataStore.providerPieData = data.providerPie || [];
                this._statusPieData.next(this.dataStore.statusPieData);
                this._providerPieData.next(this.dataStore.providerPieData);
            });
    }

    private extractResponse(res: Response): any {
        let body = res.json();
        const networkTraffic: any[] = [];
        const memorySize: any[] = [];
        const responseTime: any[] = [];
        const requestpervm: any[] = [];
        _.each(body, (item) => {
            item.ip = item.ip || '0.0.0.0';
            item.port = item.port || 'NA';
            _.each(item.history, (hist) => {
                hist.value = +hist.value;
            })
            if (item.key === 'vm.memory.size[available]') {
                networkTraffic.push(item);
            }
            if (item.key === 'vm.response.time') {
                responseTime.push(item);
            }
            if (item.key === 'vm.memory.requestpervm' || item.key === 'vm.memory.size[total]') {
                requestpervm.push(item);
            }
            if (item.key === 'vm.memory.size[available]' || item.key === 'vm.memory.size[total]') {
                memorySize.push(item);
            }
        });
        return { networkTraffic, memorySize, responseTime, requestpervm };
    }

    private extractTopoResponse(res: Response): any {
        let body = res.json();
        return body;
    }

    private extractTopoTreeResponse(res: Response): any {
        let body = res.json();
        return body;
    }

    private extractPieResponse(res: Response): any {
        let body = res.json();
        const statusPie = [];
        _.forIn(body.summary.status, function (value, key) {
            statusPie.push({
                label: key,
                value: +value,
                tooltip: key
            });
        });

        const providerPie = [];
        _.forIn(body.summary.provider, function (value, key) {
            providerPie.push({
                label: key,
                value: +value,
                tooltip: key
            });
        });

        return { statusPie, providerPie };
    }

    private handleError(error: Response | any) {
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

/* public getDataWithoutPort(): any {
        return {
            "network": [{
                "ip": "192.168.20.137",
                "key": "net.if.in[eth1]",
                "history": [{
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:01:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:02:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:03:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:04:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:05:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:06:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:07:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:08:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:09:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:10:58"
                }]
            }, {
                "ip": "192.168.20.137",
                "key": "net.if.out[eth1]",
                "history": [{
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:01:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:02:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:03:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:04:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:05:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:06:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:07:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:08:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:09:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:10:58"
                }]
            }, {
                "ip": "192.168.20.137",
                "key": "net.if.in[eth0]",
                "history": [{
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:01:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:02:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:03:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:04:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:05:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:06:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:07:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:08:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:09:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:10:58"
                }]
            }, {
                "ip": "192.168.20.137",
                "key": "net.if.out[eth0]",
                "history": [{
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:01:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:02:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:03:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:04:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:05:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:06:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:07:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:08:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:09:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:10:58"
                }]
            }, {
                "ip": "192.168.20.137",
                "key": "my[eth1]",
                "history": [{
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:01:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:02:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:03:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:04:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:05:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:06:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:07:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:08:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:09:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:10:58"
                }]
            }]
        };
    }*/
    public getData(): any {
        return {
            "network": [{
                "ip": "192.168.20.137",
                "port": "eth1",
                "key": "net.if.in",
                "history": [{
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:01:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:02:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:03:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:04:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:05:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:06:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:07:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:08:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:09:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:10:58"
                }]
            }, {
                "ip": "192.168.20.137",
                "port": "eth1",
                "key": "net.if.out",
                "history": [{
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:01:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:02:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:03:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:04:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:05:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:06:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:07:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:08:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:09:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:10:58"
                }]
            }, {
                "ip": "192.168.20.137",
                "port": "eth0",
                "key": "net.if.in",
                "history": [{
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:01:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:02:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:03:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:04:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:05:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:06:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:07:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:08:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:09:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:10:58"
                }]
            }, {
                "ip": "192.168.20.137",
                "port": "eth0",
                "key": "net.if.out",
                "history": [{
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:01:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:02:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:03:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:04:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:05:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:06:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:07:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:08:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:09:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:10:58"
                }]
            }, {
                "ip": "192.168.20.137",
                "port": "eth1",
                "key": "my",
                "history": [{
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:01:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:02:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:03:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:04:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:05:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:06:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:07:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:08:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:09:58"
                }, {
                    "value": Math.random() * 10,
                    "clock": "03/14/17 23:10:58"
                }]
            }]
        };
    }

}