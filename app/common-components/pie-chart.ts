import {Component, Input} from '@angular/core';
import {PieSeries} from '../model/pieData-model';
import {Highcharts} from 'angular2-highcharts/dist/HighchartsWrapper';

import * as _ from 'lodash';

@Component({
  selector: 'pie-chart-d3',
  template: `<chart [options]="this.options" (load)="saveInstance($event.context)"></chart>`
})
export class PieChart {
  options: Object;
  chartInstance: any;
  @Input() title: string;
  @Input() seriesTitle: string;
  @Input() series: PieSeries[];
  @Input() height: number;
  @Input() width: number;

  saveInstance(chartInstance: Object) {
    this.chartInstance = chartInstance;
  }

  constructOptions() {
    return {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        height: this.height,
        width: this.width,
        animation: true
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal'
      },
      tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b>'
      },
      title: {
        text: this.title
      },
      plotOptions: {
        series: {
          animation: true,
          dataLabels: {
            enabled: false,
            distance: -50,
            color: 'white',
            format: '{point.y}'
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
        },
        pie: {
          colors : (function () {
            const colors: any[] = [],
              base = Highcharts.getOptions().colors[0];
            let i: any;
            for (i = 0; i < 10; i += 1) {
              colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
            }
            return colors;
          }())
        }
      },
      series: [{
        name: this.seriesTitle,
        colorByPoint: true,
        animation: true,
        data: _.assign([], this.series)
      }]
    };
  }

  ngOnChanges(...args: any[]) {
    if (this.chartInstance) {
      if (this.chartInstance.series && this.chartInstance.series.length) {
        const newData = _.assign([], this.series);
        this.chartInstance.series[0].setData(newData);
      }
    }
  }

  ngOnInit() {
    this.options = this.constructOptions();
  }
}
