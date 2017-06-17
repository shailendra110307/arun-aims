import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'line-chart-d3',
  template: `<div><chart [options]="this.options"
   (load)="saveInstance($event.context)"></chart></div>`
})
export class LineChart {
  static isColorSet = false;
  options: Object;
  chartInstance: any;
  currentClickPoint: string;
  element: any;
  @Input() title: string;
  @Input() seriesTitle: string;
  @Input() series: any[];
  @Input() height: number;
  @Input() width: number;
  @Output() onFilterChange: EventEmitter<any> = new EventEmitter();

  saveInstance(chartInstance: Object) {
    this.chartInstance = chartInstance;
    const el = $(this.element.nativeElement).parent();
    this.chartInstance.setSize(el.width(), this.height, true);
  }

  constructor(myElement: ElementRef) {
    this.element = myElement;
  }

  constructOptions() {
    console.log(this.series);
    return {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        height: 400,
        width: this.width,
        padding: 0
      },
      credits: {
        enabled: false
      },
      colors: ['#4BD762', '#FF402C', '#FFCA1F', '#278ECF', '#FF9416', '#D42AE8'],
      tooltip: {
        enabled: true,
        crosshairs: [true, true],
        formatter: function () {
          return '<b>Timestamp:</b> ' + moment(this.x).format('HH:mm:ss.SSS') + '<br><b>Value:</b> ' + this.y;
        }
      },
      title: {
        text: this.title
      },
      legend: {
        enabled: (this.series && this.series.length > 1) ? true : false,
        borderWidth: 1,
        layout: 'vertical',
        backgroundColor: '#FFFFFF',
        align: 'right',
        verticalAlign: 'top',
        floating: true,
        x: 0,
        y: 25
      },
      xAxis: {
        /*title: {
          text: null
        },*/
        type: 'datetime',
        tickPixelInterval: 100,
        labels: {
          rotation: -45,
          formatter: function () {
            return moment(this.value).format('HH:mm:ss'); // clean, formatted number for time
          }
        }
      },
      yAxis: {
        title: {
          text: null
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      plotOptions: {
        line: {
          marker: {
            enabled: false,
            symbol: 'circle',
            radius: 0.1,
            states: {
              hover: {
                enabled: true
              }
            }
          }
        },
        series: {
          fillOpacity: 0.9,
          animationLimit: Infinity,
          animation: {
            duration: 2000
          },
          point: {
            events: {
              legendItemClick: function () {
                return false; // <== returning false will cancel the default action
              }
            }
          },
          allowPointSelect: false,
          showInLegend: true
        }
      },
      series: _.map(this.series, (series: any) => {
        return {
          name: series.name,
          data: _.assign([], series.data)
        };
      })
    };
  }

  ngOnChanges(...args: any[]) {
    const me = this;
    if (this.chartInstance) {
      if (this.chartInstance.series && this.chartInstance.series.length) {
        _.each(this.series, (series: any, index: number) => {
          me.chartInstance.series[index].setData(_.assign([], series.data));
        });
      }
    }
  }

  ngOnInit() {
    this.options = this.constructOptions();
  }
}
