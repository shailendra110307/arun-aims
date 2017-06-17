import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import * as moment from 'moment';
declare const d3: any;
declare const c3: any;

@Component({
  styles: [
    `.full-screen{position: absolute; top: 0; bottom:0; left: 0; right:0; z-index:5001; width: 100%}`, 
    `.full-screen .panel {height: 100%}`,
    `.full-screen .panel-body {height: calc(100% - 75px)}`],
  template: `<div class="row">
    <div class="col-md-9" style="padding:0">
      <div class="col-md-3 card">
        <div class="panel panel-default">
              <div class="panel-heading">
                  <h4>Memory - Disk 1</h4>
              </div>
              <div class="panel-body">
                  <h1>80% <i class="glyphicon glyphicon-arrow-down success"></i><small class="success">-2%</small></h1>
                  <div class="same-chart-1">
                  </div>
              </div>
        </div>
      </div>
      <div class="col-md-3 card">
        <div class="panel panel-default">
              <div class="panel-heading">
                  <h4>Memory - Disk 2</h4>
              </div>
              <div class="panel-body">
                  <h1>65% <i class="glyphicon glyphicon-arrow-up error"></i><small class="error">+1%</small></h1>
                  <div class="same-chart-2">
                  </div>
              </div>
        </div>
      </div>
      <div class="col-md-3 card">
        <div class="panel panel-default">
              <div class="panel-heading">
                  <h4>Memory - Disk 3</h4>
              </div>
              <div class="panel-body">
                  <h1>72% <i class="glyphicon glyphicon-minus"></i><small class="error">--</small></h1>
                  <div class="same-chart-3">
                  </div>
              </div>
        </div>
      </div>
      <div class="col-md-3 card">
        <div class="panel panel-default">
              <div class="panel-heading">
                  <h4>Memory - Disk 4</h4>
              </div>
              <div class="panel-body">
                  <h1>56% <i class="glyphicon glyphicon-arrow-down success"></i><small class="success">-2%</small></h1>
                  <div class="same-chart-4">
                  </div>
              </div>
        </div>
      </div>
      <div class="col-md-6 card">
        <div class="panel panel-default">
              <div class="panel-heading">
                  <h4>Usage</h4>
              </div>
              <div class="panel-body">
                  <div id="usageChart">
                  </div>
              </div>
        </div>
      </div>
      <div class="col-md-3 card">
        <div class="panel panel-default">
              <div class="panel-heading">
                  <h4>Status</h4>
              </div>
              <div class="panel-body">
                  <div id="status-graph">
                  </div>
              </div>
        </div>
      </div>
      <div class="col-md-3 card">
        <div class="panel panel-default">
            <div class="panel-heading"><h4>Active Users</h4></div>
            <div class="panel-body" style="padding-top: 0">
                <div style="height:180px">
                    <p style="margin-bottom: 0;">Active users today</p>
                    <h1 style="margin-top: 0;">3.5 K <small><i class="glyphicon glyphicon-arrow-up"></i> +3%</small></h1>
                    <p style="margin-bottom: 0;">Active users this week</p>
                    <h3 style="margin-top: 0; border: 0;">3.5 K <small><i class="glyphicon glyphicon-arrow-up"></i> +3%</small></h3>
                    <p style="margin-bottom: 0;">Active users this month</p>
                    <h3 style="margin-top: 0; border: 0;">3.5 K <small><i class="glyphicon glyphicon-arrow-up"></i> +3%</small></h3>
                </div>
            </div>
        </div>
      </div>
      <div class="col-md-3 card">
        <div class="panel panel-default">
            <div class="panel-heading"><h4>Error percentage</h4></div>
            <div class="panel-body">
                <div  id="error-chart1">
                </div>
                <div  id="error-chart">
                </div>
            </div>
        </div>
      </div>
      <div class="col-md-4 card">
        <div class="panel panel-default">
            <div class="panel-heading"><h4>Application errors</h4></div>
            <div class="panel-body">
                <div class="app-error">
                  <div class="percentage" style="width: 80%">Tomcat<div class="pull-right">15</div></div>
                </div>
                <div class="app-error">
                  <div class="percentage" style="width: 60%">Oracle<div class="pull-right">11</div></div>
                </div>
                <div class="app-error">
                  <div class="percentage"  style="width: 80%">SAP<div class="pull-right">15</div></div>
                </div>
                <div class="app-error">
                  <div class="percentage" style="width: 50%">MySQL<div class="pull-right">7</div></div>
                </div>
                <div class="app-error">
                  <div class="percentage" style="width: 20%">&nbsp;<div class="pull-right">4</div></div>
                  <div class="pull-right text">Node</div>
                </div>
            </div>
        </div>
      </div>
      <div class="card col-md-5" [ngClass]="{'full-screen': this.maximize === 'network'}">
        <div class="panel panel-default">
              <div class="panel-heading">
                  <h4 (click)="onMaximizeClick('network')">Network</h4>
              </div>
              <div class="panel-body">
                  <div id="network-chart">
                  </div>
              </div>
        </div>
      </div>
    </div>
    <div class="col-md-3" style="padding:0">
      <div class="col-xs-12 card">
        <div class="panel panel-default">
          <div class="panel-thumbnail" style="position: relative; background-color: white">
            <img src="http://www.startupist.com/wp-content/uploads/2014/11/network1.jpg" class="img-responsive" style="opacity: .3" />
            <h1 style="color: #333; position: absolute; bottom: 10px; left: 10px;  text-shadow: 2px 2px #ddd; font-weight: 800">DAL Server
            <br/><small style="color: #333; font-size: 50%">192.168.10.2</small></h1>
          </div>
          <div class="panel-body">
            <ul class="list-group">
              <li class="list-group-item">Status<div class="pull-right success" style="font-weight: 800">Active</div></li>
              <li class="list-group-item">Connections
                <div class="pull-right">120 
                  <i class="glyphicon glyphicon-arrow-down success"></i><small class="success">-2%</small>
                </div>
              </li>
              <li class="list-group-item">Bandwidth
                <div class="pull-right">
                  <i class="glyphicon glyphicon-arrow-up success"></i><small class="success">850</small> / 
                  <i class="glyphicon glyphicon-arrow-down error"></i><small class="error">300</small> Mbps
                </div>
              </li>
              <li class="list-group-item">Active Since<div class="pull-right">130 Days</div></li>
              <li class="list-group-item">Security Patch<div class="pull-right">2 days old</div></li>
              <li class="list-group-item">OS<div class="pull-right">Linux</div></li>
              <li class="list-group-item">Running processes<div class="pull-right">132 
                <i class="glyphicon glyphicon-arrow-up error"></i><small class="error">+2</small></div></li>
              <li class="list-group-item">FQDN<div class="pull-right">abcd.cnet-global.com</div></li>
            </ul>
          </div>
        </div>
      </div>
    <div class="col-xs-3 card">
        <button class="col-xs-12 btn btn-default" style="margin-bottom: 0">
            <i class="glyphicon glyphicon-off"></i>
        </button>
      </div>
      <div class="col-xs-3 card">
        <button class="col-xs-12 btn btn-default" style="margin-bottom: 0">
            <i class="glyphicon glyphicon-repeat"></i>
        </button>
      </div>
      <div class="col-xs-3 card">
        <button class="col-xs-12 btn btn-default" style="margin-bottom: 0">
            <i class="glyphicon glyphicon-pause"></i>
        </button>
      </div>
      <div class="col-xs-3 card">
        <button class="col-xs-12 btn btn-default" style="margin-bottom: 0">
            <i class="glyphicon glyphicon-cog"></i>
        </button>
      </div>
    <div class="col-xs-12 card">
     <button class="col-xs-12 btn btn-primary">
        More Details
     </button>
     <button class="col-xs-12 btn btn-default">
        Raise a ticket
     </button>
     <button class="col-xs-12 btn btn-default">
        Contact system admin
     </button>
    </div>
    <div class="col-xs-12 card">
      <span class="pull-right">&copy; 2017, cnet-global.com</span>
    </div>
  </div>
  </div>
  `
})
export class MonitoringNewView {
  isWidget: boolean;
  data1: any;
  usageChart: any;
  memoryChart1: any;
  memoryChart2: any;
  memoryChart3: any;
  memoryChart4: any;
  errorChart: any;
  errorChart1: any;
  statusChart: any;
  networkChart: any;
  maximize: string = '';

  DATA1: any;
  DATA2: any;
  DATA3: any[];

  timer: any;
  subscription: any;

  refreshInterval: number;

  constructor(private router: Router) {
    this.refreshInterval = 500;
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

  resizeChart(chart: any, size){
    chart.resize({
        height: size
    });
  }

  onMaximizeClick(element) {
    const me = this;
    if(this.maximize === element) {
      if(element === 'network'){
        setTimeout(this.resizeChart, 10, this.networkChart, 180);
      }
      return this.maximize = '';
    }
    if(element === 'network'){
      setTimeout(this.resizeChart, 10, this.networkChart, 500);
    }
    return this.maximize = element;
  }

  ngOnInit() {
    this.DATA1 = this.getData1(50);
    this.DATA2 = this.getData2(50);
    this.DATA3 = this.getData3(50);

    this.usageChart = c3.generate({
      bindto: '#usageChart',
      size: {
        height: 180
      },
      type: 'area',
      padding: {
        right: 10,
      },
      data: {
        json: this.DATA1,
        keys: {
          x: 'timestamp', // it's possible to specify 'x' when category axis
          value: ['cpu', 'disk', 'network'],
        },
        types: {
          cpu: 'area-spline',
          disk: 'area-spline',
          network: 'area-spline'
        }
      },
      transition: {
        duration: null
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            culling: {
              max: 4
            },
            format: '%m/%d %H:%M'
          }
        }
      },
      point: {
        show: false
      }
    });

    const mem_chart: any = {
      size: {
        height: 60
      },
      type: 'area',
      padding: {
        right: 10,
      },
      data: {
        json: this.DATA1,
        keys: {
          x: 'timestamp', // it's possible to specify 'x' when category axis
          value: ['memory'],
        },
        types: {
          memory: 'area'
        }
      },
      transition: {
        duration: null
      },
      axis: {
        x: {
          show: false,
          type: 'timeseries',
          tick: {
            culling: {
              max: 4
            },
            format: '%m/%d %H:%M'
          }
        },
        y: {
          show: false
        }
      },
      point: {
        show: false
      },
      legend: {
        show: false
      }
    };

    this.memoryChart1 = c3.generate(_.extend({ bindto: '.same-chart-1' }, mem_chart));
    this.memoryChart2 = c3.generate(_.extend({ bindto: '.same-chart-2' }, mem_chart));
    this.memoryChart3 = c3.generate(_.extend({ bindto: '.same-chart-3' }, mem_chart));
    this.memoryChart4 = c3.generate(_.extend({ bindto: '.same-chart-4' }, mem_chart));

    this.errorChart = c3.generate({
      bindto: '#error-chart',
      size: {
        height: 80
      },
      type: 'bar',
      padding: {
        right: 10,
      },
      data: {
        json: this.DATA3,
        keys: {
          x: 'timestamp', // it's possible to specify 'x' when category axis
          value: ['errors'],
        },
        types: {
          errors: 'bar'
        },
        colors: {
          errors: '#cc0000',
        }
      },
      transition: {
        duration: null
      },
      axis: {
        x: {
          show: false,
          type: 'timeseries',
          tick: {
            culling: {
              max: 4
            },
            format: '%m/%d %H:%M'
          }
        },
        y: {
          show: false
        }
      },
      point: {
        show: false
      },
      legend: {
        show: false
      }
    });
    this.errorChart1 = c3.generate({
      bindto: '#error-chart1',
      type: 'gauge',
      size: {
        height: 100
      },
      data: {
        columns: [
          ['Error', 8],
        ],
        colors: {
          Error: '#cc0000',
        },
        type: 'gauge'
      },
    });

    this.statusChart = c3.generate({
      bindto: '#status-graph',
      type: 'donut',
      size: {
        height: 180
      },
      legend: {
        position: 'right'
      },
      transition: {
        duration: null
      },
      data: {
        columns: [
          ['Active', 130],
          ['Error', 5],
        ],
        colors: {
          Active: '#008000',
          Error: '#cc0000',
        },
        type: 'donut'
      },
      donut: {
        title: 'Status',
        label: {
          show: false
        },
      }
    });

    this.networkChart = c3.generate({
      bindto: '#network-chart',
      size: {
        height: 180
      },
      type: 'line',
      padding: {
        right: 10,
      },
      data: {
        json: this.DATA2,
        keys: {
          x: 'timestamp', // it's possible to specify 'x' when category axis
          value: ['upload', 'download'],
        },
        types: {
          upload: 'line',
          download: 'line'
        }
      },
      transition: {
        duration: null
      },
      zoom: {
          enabled: true
      },
      subchart: {
        show: true,
        size: {
          height: 20
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            culling: {
              max: 4
            },
            format: '%m/%d %H:%M'
          }
        }
      },
      point: {
        show: false
      }
    });

    this.timer = Observable.timer(0, 1000);
    this.subscription = this.timer.subscribe(() => {
      const newData1 = this.getData1(1);
      this.DATA1 = _.take(_.concat(newData1, this.DATA1), 50);
      const newData2 = this.getData2(1);
      this.DATA2 = _.take(_.concat(newData2, this.DATA2), 50);
      const newData3 = this.getData3(1);
      this.DATA3 = _.take(_.concat(newData3, this.DATA3), 50);
      this.usageChart.load({
        json: this.DATA1,
        keys: {
          x: 'timestamp', // it's possible to specify 'x' when category axis
          value: ['cpu', 'disk', 'network'],
        }
      });
      this.memoryChart1.load({
        json: this.DATA1,
        keys: {
          x: 'timestamp', // it's possible to specify 'x' when category axis
          value: ['memory'],
        }
      });
      this.memoryChart2.load({
        json: this.DATA1,
        keys: {
          x: 'timestamp', // it's possible to specify 'x' when category axis
          value: ['memory'],
        }
      });
      this.memoryChart3.load({
        json: this.DATA1,
        keys: {
          x: 'timestamp', // it's possible to specify 'x' when category axis
          value: ['memory'],
        }
      });
      this.memoryChart4.load({
        json: this.DATA1,
        keys: {
          x: 'timestamp', // it's possible to specify 'x' when category axis
          value: ['memory'],
        }
      });
      // this.networkChart.load({
      //   json: this.DATA2,
      //   keys: {
      //     x: 'timestamp', // it's possible to specify 'x' when category axis
      //     value: ['upload', 'download'],
      //   },
      // });
      this.errorChart.load({
        json: this.DATA3,
        keys: {
          x: 'timestamp', // it's possible to specify 'x' when category axis
          value: ['errors'],
        }
      });
      this.errorChart1.load({
        columns: [
          ['Error', _.head(this.DATA3).errors],
        ],
      });
    });
  }

  ngOnDestroy() {
    if (this.subscription && this.subscription.unsubscribe) {
      this.subscription.unsubscribe();
    }
  }

  getData1(count = 1): any[] {
    const newData1 = [];
    const currentTime = _.toNumber(moment().format('x'));
    _.times(count, function (x) {
      newData1.push({
        timestamp: currentTime - (x * 1000),
        cpu: _.random(25, 75, true),
        memory: _.random(25, 75, true),
        disk: _.random(25, 75, true),
        network: _.random(25, 75, true)
      });
    });
    return newData1;
  }

  getData2(count = 1): any[] {
    const newData1 = [];
    const currentTime = _.toNumber(moment().format('x'));
    _.times(count, function (x) {
      newData1.push({
        timestamp: currentTime - (x * 1000),
        download: _.random(300, 1023, true),
        upload: _.random(25, 186, true)
      });
    });
    return newData1;
  }

  getData3(count = 1): any[] {
    const newData1 = [];
    const currentTime = _.toNumber(moment().format('x'));
    _.times(count, function (x) {
      newData1.push({
        timestamp: currentTime - (x * 1000),
        errors: _.random(3, 46),
      });
    });
    return newData1;
  }
}
