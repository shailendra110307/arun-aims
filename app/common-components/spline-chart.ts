import {Component, Input, Output, EventEmitter} from '@angular/core';
import {PieSeries} from '../model/pieData-model';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'spline-chart',
  template: `<chart [options]="this.options" (load)="saveInstance($event.context)" 
              (click)="mouseOver($event)" (click)="mouseOut($event)"></chart>`
})
export class SplineChart {
  static isColorSet = false;
  options: Object;
  chartInstance: any;
  currentClickPoint: string;
  @Input() title: string;
  @Input() seriesTitle: string;
  @Input() series: PieSeries[];
  @Input() height: number;
  @Input() width: number;
  @Output() onFilterChange: EventEmitter<any> = new EventEmitter();

  saveInstance(chartInstance: Object) {
    this.chartInstance = chartInstance;
  }

  mouseClick(e: any) {
    this.currentClickPoint = this.currentClickPoint !== e.target.point.name ? e.target.point.name : '';
    this.onFilterChange.emit({name: this.currentClickPoint});
  }

  mouseOver(e: any) {
    // const pieIndex = e.target.index;
    // const colName = this.series[pieIndex][0];
    // this.onFilterChange.emit({name: colName});
  }

  mouseOut(e: any) {
    // this.onFilterChange.emit({name: ''});
  }

  constructOptions() {
    console.log(this.series);
    return {
      chart: {
        type: 'spline',
        backgroundColor: 'transparent',
        height: 400,
        width: this.width,
        padding: 0
      },
      credits: {
        enabled: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#FCFFC5',
        borderColor: 'black',
        borderRadius: 10,
        borderWidth: 1,
        crosshairs: [true, true],
        formatter: function() {
        return '<b>Timestamp: </b>' + this.x + '<br><b>Value:</b> ' + this.y;
         }
      },
      title: {
        text: this.title
      },
       subtitle: {
        text: 'Source: Datacenter'
      },
      legend: {
            enabled: true,
            borderWidth: 1
        },
      xAxis: {
            title: {
              text: 'Time Interval'
            },
            type: 'datetime',
            tickPixelInterval: 100,
             labels: {
               rotation: -45,
                formatter: function () {
                    return  moment(this.value).format('HH:mm:ss.SSS'); // clean, formatted number for time
                }
            }
        },
        yAxis: {
            title: {
                text: this.seriesTitle
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808083'
            }]
        },
        plotOptions: {
            spline: {
              marker: {
                enabled: true,
                 symbol: 'circle',
                  radius: 1.0,
                  states: {
                    hover: {
                        enabled: true
                      }
                    }
              }
            }
        },
      series: [{
        name: this.seriesTitle,
        data: _.assign([], this.series)
      }]
    };
  }

  ngOnChanges(...args: any[]) {
    if (this.chartInstance) {
      if (this.chartInstance.series && this.chartInstance.series.length) {
        this.chartInstance.series[0].setData(_.assign([], this.series));
      }
    }
  }

  ngOnInit() {
    this.options = this.constructOptions();
  }
}
