import {Component, Input, Output, EventEmitter} from '@angular/core';
import {PieSeries} from '../model/pieData-model';

import * as _ from 'lodash';

@Component({
  selector: 'filterpie-chart',
  template: `<chart [options]="this.options" (load)="saveInstance($event.context)" 
              (click)="mouseOver($event)" (click)="mouseOut($event)"></chart>`
})
export class FilterPieChart {
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
    return {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        height: this.height,
        width: this.width,
        animation: true,
        margin: 0,
        padding: 0
      },
      credits: {
        enabled: false
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        itemStyle: {
          color: '#000000',
          fontWeight: 'crisp',
          fontSize: '12px'
        }
      },
      tooltip: {
        enabled: true,
        pointFormat: '<b>{point.y} VMs</b>'
      },
      title: {
        text: ''
      },
      plotOptions: {
        series: {
          point: {
            events: {
              click: (e: any) => this.mouseClick(e),
              legendItemClick: function () {
                return false; // <== returning false will cancel the default action
              }
            }
          },
          animation: true,
          dataLabels: {
            enabled: true,
            distance: -50,
            color: 'black',
            format: '{point.y}'
          },
          allowPointSelect: false,
          showInLegend: true
        }
      },
      series: [{
        name: this.seriesTitle,
        colorByPoint: true,
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
