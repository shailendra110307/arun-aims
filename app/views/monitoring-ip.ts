/**
 * Created by Rini Daniel on 2/2/2017.
 */

import { Component, ChangeDetectorRef } from '@angular/core';
import { MonitoringIP } from '../model/monitoringIP-model';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MonitoringIPService } from '../services/monitoringIP-service';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

@Component({
  providers: [MonitoringIPService],
  template: `<div class="container">
              <div class="row">
                <div id="breadcrumb" class="col-md-12">
                  <ol class="breadcrumb">
                    <li><a [routerLink]="(isWidget ? '/widget-monitoring' : '/dashboard')">Home</a></li>
                    <li><a [routerLink]="(isWidget ? '/widget-monitoring' : '/monitoring')">Monitoring</a></li>
                    <li><a href="Javascript:void(0)">Server Monitoring</a></li>
                  </ol>
                </div>
             </div>
             <div class="row">
                      <div class="col-md-12">
                          <div class="col-md-2">
                                  <div class="x_panel">
                                        <div class="x_title">
                                            <h2 class="container monitoring_center">Server Information</h2>
                                            <div class="clearfix"></div>
                                        </div>
                                        <div class="x_content">
                                              <p>Server Status: Active</p>
                                              <p>Node: Jump Host</p>
                                              <p>Public IP: 192.168.20.137</p>
                                              <p>Private IP: 192.168.1.20</p>
                                              <p>FQDN: deployment.cnet.com</p>
                                              <p>Domain Name:	cnet.com</p>
                                              <p>Operating System:	Ubuntu 14.04</p>
                                              <p>Data Center:	Dallas</p>
                                              <p>Provider:	Baremetal</p>
                                              <p>Project:</p>
                                              <p>Role: Deployment Server</p>
                                        </div>
                                    </div>
                                    <div class="x_panel">
                                        <div class="x_title">
                                        <h2 class="container monitoring_center">Server Facts</h2>
                                        <div class="clearfix"></div>
                                        </div>
                                        <div class="x_content">
                                        <p>Active Users: 10</p>
                                        <p>Processes running: 19</p>
                                        <p>Status: Active</p>
                                        <p>ACtive Since: 135 days</p>
                                        <p>Average CPU Utilisation: 2.304%</p>
                                        <p>Average Memory Utilisation: 2.5765GB</p>
                                        </div>
                                    </div>
                            </div>
                       
                            <div class="col-md-6 charts">
                                <div class="x_panel">
                                                <area-chart-old  title="CPU Utilization" seriesTitle="CPU Utilization" max = "100"
                                                [series]="[{name:'Idle time', data: this.monitoringIp.cpuUtilisationIdle},
                                                {name:'User', data: this.monitoringIp.cpuUtilisationUser}, 
                                                {name:'System', data: this.monitoringIp.cpuUtilisationSystem},
                                                {name:'IOWait', data: this.monitoringIp.cpuUtilisationIOWait}, 
                                                {name:'Nice Time', data: this.monitoringIp.cpuUtilisationNiceTime}]" 
                                                height = "200" width="300">
                                                  </area-chart-old>
                                </div>
                                <div class="x_panel">
                                              <line-chart-d3  title="Network Traffic" seriesTitle="Network Traffic" 
                                              [series]="[{name:'input traffic', data: this.monitoringIp.inputNetworkTraffic}, 
                                              {name:'output traffic', data: this.monitoringIp.outputNetworkTraffic}]" 
                                              height = "200" width="300" >
                                                </line-chart-d3>
                                </div>
                                <div class="x_panel">
                                          <area-chart-old  title="Memory Usage" seriesTitle="Memory Usage" 
                                          [series]="[{name:'Memory Usage', data: this.monitoringIp.memoryUsage}]" 
                                          height = "200" width="300">
                                            </area-chart-old>
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                 <div class="x_panel">
                                    <div class="x_title">
                                    <h2 class="container monitoring_center">Disk Utlisation</h2>
                                    <div class="clearfix"></div>
                                    </div>
                                    <div class="x_content">
                                    <p>Disk Used: 40%</p>
                                    </div>
                                </div>
                                <div class="x_panel">
                                    <div class="x_title">
                                    <h2 class="container monitoring_center">List of Applications</h2>
                                    <div class="clearfix"></div>
                                    </div>
                                    <div class="x_content">
                                          <table class="table table-bordered table-striped" >
                                              <thead>
                                                    <tr>
                                                      <th>Name</th>
                                                      <th>Total</th>
                                                      <th>Available</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                  <tr>
                                                      <td>/dev/disk1</td>
                                                      <td>10</td>
                                                      <td>5</td>
                                                  </tr>
                                                  </tbody>
                                            </table>
                                    </div>
                              </div>
                              <div class="x_panel">
                              <d3-area-chart></d3-area-chart>
                              </div>
                          </div>
                    </div>
             </div> `
})
export class IPMonitoringView {
  monitoringIp: MonitoringIP;
  host: any;
  subscription: any;
  timer: any;

  isWidget: boolean;

  constructor(private router: Router, route: ActivatedRoute, private monitoringIPService: MonitoringIPService,
    private ref: ChangeDetectorRef) {
    this.host = route.snapshot.params['host'];
    this.monitoringIp = new MonitoringIP();
    this.isWidget = false;
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (_.startsWith(val.url, '/widget')) {
          this.isWidget = true;
        } else {
          this.isWidget = false;
        }
      }
    });
  }

  ngOnInit() {
    this.timer = Observable.timer(0, 2000);
    this.subscription = this.timer.subscribe(() => {
      this.monitoringIPService.getIPDetails(this.host).subscribe(
        data => {
          this.monitoringIp.setData(data.result.values);
          this.ref.detectChanges();
        },
        () => console.log('Finished')
      );
    });
  }
  ngOnDestroy() {
    if (this.subscription && this.subscription.unsubscribe) {
      this.subscription.unsubscribe();
    }
  }
}
