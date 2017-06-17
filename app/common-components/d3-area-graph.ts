import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
declare const nv: any;
declare const d3: any;

import { DATA } from './data.js';

@Component({
    selector: 'd3-area-chart',
    styles: ['#d3-area-graph svg{height:500px}'],
    template: `<div id="d3-area-graph"><svg></svg></div>`
})
export class D3AreaChart {
    @ViewChild('graphContainer') graphContainer: ElementRef;
    @Input() data: any;

    ngOnInit() {
        nv.addGraph(function () {
            const chart = nv.models.stackedAreaChart()
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; })
                .clipEdge(false)
                .useInteractiveGuideline(true)
                .controlLabels({stacked: 'Stacked'});

            chart.xAxis
                .showMaxMin(false)
                .tickFormat(function (d) { return d3.time.format('%x')(new Date(d)); });

            chart.yAxis
                .tickFormat(d3.format(',.2f'));

            d3.select('#d3-area-graph svg')
                .datum(DATA)
                .transition().duration(500).call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    }
}