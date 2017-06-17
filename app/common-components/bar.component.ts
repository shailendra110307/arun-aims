
import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { DatasetService } from '../services/dataset-service';

import { Daterangepicker } from 'ng2-daterangepicker';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import * as moment from 'moment';

@Component({
  moduleId: module.id,
  selector: 'bar-chart',
  templateUrl: 'bar.component.html',
  styleUrls: ['bar.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(window:resize)': 'onResize($event)'
  }
})

export class BarComponent implements OnInit {
  @ViewChild('barchart') private chartContainer: ElementRef;
  @Input() public options: any = {};
  private chartId: string;
  private element: any;
  private isData: any = true;
  private type: string;
  private typeIsGrouped: boolean;
  private typeLabelSelected: string = "";
  private typeLabelUnselected: string = "";
  private initData: any;
  private data: any;
  private keys: any[];
  private selectedKey: string;
  private margin: any;
  private svg: any;
  private tooltip: any;
  private container: any;
  private width: number;
  private height: number;
  private duration: number;
  private xScale: any;
  private xScaleOrdinal: any;
  private xScaleOrdinalState: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private xAxisState: any;
  private yAxis: any;
  private legend: any;
  private radius: number;
  private formatDatapicker: any = d3.timeFormat("%m/%d/%y");
  private format: any = d3.timeFormat("%m/%d/%y %H:%M:%S");
  private parseDate: any = d3.timeParse("%m/%d/%y %H:%M:%S");
  private bisectDate = d3.bisector((d: any) => d.date).left;
  private saveTextWidth: number = 30;
  private zoomTextWidth: number = 30;
  private brush: any;
  private brushContainer: any;
  private xScaleBrush: any;
  private xAxisBrush: any;
  private marginBrush: any;
  private heightBrush: number;
  private subscription: any;

  private zoom: any;

  public mainInput = {
    start: moment().subtract(2, 'month'),
    end: moment().subtract(1, 'month')
  }

  constructor(private datasetService: DatasetService, private elementRef: ElementRef, private daterangepickerOptions: DaterangepickerConfig) {
    this.daterangepickerOptions.settings = {
      locale: { format: 'MM/DD/YY' },
      alwaysShowCalendars: false,
    };
  }

  public ngOnInit() {// we can use this.options
    let native = this.elementRef.nativeElement;
    this.chartId = native.getAttribute("data-id") || "bar-chart-id-" + Date.now();
    this.type = native.getAttribute("data-type");
    if (this.type === 'grouped') {
      this.typeIsGrouped = true;
      this.typeLabelSelected = 'Grouped';
      this.typeLabelUnselected = 'Stacked';
    } else if (this.type === 'stacked') {
      this.typeIsGrouped = false;
      this.typeLabelSelected = 'Stacked';
      this.typeLabelUnselected = 'Grouped';
    }
    let subscribe: any = native.getAttribute("data-subscribe");
    if (!subscribe) {
      this.isData = false;
      return;
    }
    this.subscription = this.datasetService[subscribe].subscribe((initData: any) => {
      if (!initData) {
        return;
      }
      this.initData = initData;
      this.keys = d3.nest().key((d: any) => d.port).entries(initData);
      this.selectedKey = this.keys[0].key;
      this.element = this.chartContainer.nativeElement;

      const isDropDown = native.getAttribute("data-dropdown") || "false";
      if(isDropDown === 'true') {
        this.createKeyDropdown();
      }
      this.run();
    });
  }

  private selectedDate(value: any) {
    let xDomain = [value.start._d, value.end._d];
    this.xScale.domain(xDomain);
    this.container.selectAll(".bar-group")
      .transition().duration(this.duration)
      .attr("transform", (d: any) => "translate(" + (this.xScale(d.date) - this.xScaleOrdinalState.bandwidth() / 2) + ",0)");
    this.container.select(".axis-x").transition().duration(this.duration).call(this.xAxis);
    this.svg.selectAll(".axis text").style('fill', this.options.textColor || "#000");
    this.container.select(".date-range").text(this.format(new Date(xDomain[0])) + "   -   " + this.format(new Date(xDomain[1])));
  }

  private changeBarType(value: any) {
    // this.typeLabel = value.target.checked;
    this.typeIsGrouped = !this.typeIsGrouped;
    if (this.type === 'grouped') {
      this.type = 'stacked';
    } else {
      this.type = 'grouped';
    }
    this.run()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private run() {
    let data = (this.keys.filter((d: any) => d.key === this.selectedKey))[0];
    this.data = [];
    data.values[0].history.map((d: any) => {
      let obj: any = {
        "id": d.clock,
        "date": this.parseDate(d.clock),
        "values": []
      };
      data.values.map((key: any, i: number) => {
        let o = (key.history.filter((f: any) => { return f.clock === d.clock; }))
        obj.values.push({
          i: i,
          key: key.key,
          ip: key.ip,
          value: (o && o.length > 0 && o[0].value) ? +o[0].value : 0// if one object does not have some date
        });
      });
      this.data.push(obj);
    });

    let start = new Date(this.data[0].date);//this.data[0].date;
    let startValues = this.data[0].values;
    start.setMinutes(start.getMinutes() - 1);
    let end = new Date(this.data[this.data.length - 1].date);
    let endValues = this.data[0].values;
    end.setMinutes(end.getMinutes() + 1);

    this.data.unshift({
      "id": this.format(start),
      "hide": true,
      "date": start,
      "values": data.values.map((d: any, i: number) => { return { i: i, ip: d.ip, key: d.key, value: 0 }; })
    });
    this.data.push({
      "id": this.format(end),
      "hide": true,
      "date": end,
      "values": this.keys.map((d: any, i: number) => { return { i: i, ip: d.ip, key: d.key, value: 0 }; })
    });

    if (!this.svg && this.data) { this.create(); }
    if (this.svg && this.data) { this.update(); }
  }


  onResize(event: any) {
    if (this.container) {
      this.updateSize();
      this.update();
    }
  }


  private convertToCSV(objArray: string) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    array.map((object: any, i: number) => {
      if (i === 0) {
        var title = '';
        for (var index in object) {
          if (title != '') title += ','
          title += '"' + index + '"';
        }
        str += title + '\r\n';
      }

      var line = '';
      for (var index in object) {
        if (line != '') line += ','
        line += '"' + object[index] + '"';
      }
      str += line + '\r\n';
    });
    return str;
  }

  private createKeyDropdown() {
    d3.select(this.element).select('.select').remove();
    var select = d3.select(this.element).append('select')
      .attr("class", "select");
    var options = select
      .selectAll('option')
      .data(this.keys).enter()
      .append('option')
      .text(function (d) {
        return d.key;
      });
    select.on("change", (e) => {
      this.selectedKey = select.property("value");//select.node().value + "";
      this.run();
    });
    // var selectedKey = this.keys[this.keys.length - 1].key;
    // select.property('value', selectedKey);
  }

  private createSaveDropdown() {

    let saveImage = (type: string) => {
      saveSvgAsPng(document.getElementById("bar-svg"), `bar_ + ${Date.now()}.${type}`, { scale: 10 });
    }
    let saveJson = (type: string) => {
      let a = document.createElement('a');
      a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(JSON.stringify(this.initData)));
      a.setAttribute('download', `bar_ + ${Date.now()}.json`);
      a.click();
    }
    let saveCsv = (type: string) => {
      let json: any = [];
      this.keys.map((keyObj: any) => {
        keyObj.values.map(function (valueObj: any): void {
          valueObj.history.map(function (obj: any): void {
            json.push({ port: valueObj.port, ip: valueObj.ip, key: valueObj.key, clock: obj.clock, value: obj.value.toFixed(2) })
          });
        });
      });
      let a = document.createElement('a');
      a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(this.convertToCSV(json)));
      a.setAttribute('download', `bar_ + ${Date.now()}.csv`);
      a.click();
    }

    let saveText = [
      { name: 'png', callback: saveImage },
      { name: 'jpeg', callback: saveImage },
      { name: 'json', callback: saveJson },
      { name: 'csv', callback: saveCsv }
    ];

    d3.select(this.element).select('.save-select').remove();
    var select = d3.select(this.element).append('select')
      .style("right", this.margin.right + "px").style("top", "0px").style("left", "initial").style("bottom", "initial")
      .attr("class", "save-select");
    var options = select
      .selectAll('option')
      .data(saveText).enter()
      .append('option')
      .style("font-size", this.options.textColor || "12px")
      .style("font-family", '"myverdana"')
      .style("text-anchor", "end")
      .style("fill", this.options.textColor || "#999")
      .style("cursor", "pointer")
      .text((d: any) => d.name);
    select.on("change", (e) => {
      let name = select.property("value");//select.node().value + "";
      saveText.map((s: any) => {
        if (s.name === name) {
          s.callback(s.name)
        }
      })
    });

  }

  private createZoomDropdown() {
    let zoomText = ["5M", "15M", "30M", "1H", "2H", "3H", "6H", "12H", "1d", "3d", "7d", "14d", "1m", "2m", "all"];

    d3.select(this.element).select('.zoom-select').remove();
    var select = d3.select(this.element).append('select')
      .style("left", (this.margin.left + 179) + "px")//150 = daterange-picker + 20 margin
      .style("top", "0px").style("right", "initial").style("bottom", "initial")
      .attr("class", "zoom-select");
    var options = select
      .selectAll('option')
      .data(zoomText).enter()
      .append('option')
      .attr("class", "zoom-select")
      .style("font-size", this.options.textColor || "12px")
      .style("font-family", '"myverdana"')
      .style("text-anchor", "start")
      .style("fill", this.options.textColor || "#999")
      .style("cursor", "pointer")
      .text((d: any) => d);
    select.on("change", (e: any) => {
      let z = select.property("value");//select.node().value + "";
      let xDomain = this.xScale.domain();
      let n = +z.replace(/[^0-9\.]+/g, "");
      let s = z.replace(/[^A-Za-z\.]+/g, "");
      if (s === "M") {
        let newDate: any = (new Date(this.format(xDomain[0]))).setMinutes(xDomain[0].getMinutes() + n);
        if (newDate < xDomain[1].getTime()) {
          xDomain[1].setMonth(xDomain[0].getMonth());
          xDomain[1].setDate(xDomain[0].getDate());
          xDomain[1].setHours(xDomain[0].getHours());
          xDomain[1].setMinutes(xDomain[0].getMinutes() + n + 1);
        } else {
          return;
        }
      } else if (s === "H") {
        let newDate: any = (new Date(this.format(xDomain[0]))).setHours(xDomain[0].getHours() + n);
        if (newDate < xDomain[1].getTime()) {
          xDomain[1].setMonth(xDomain[0].getMonth());
          xDomain[1].setDate(xDomain[0].getDate());
          xDomain[1].setHours(xDomain[0].getHours() + n);
        } else {
          return;
        }
      } else if (s === "d") {
        let newDate: any = (new Date(this.format(xDomain[0]))).setDate(xDomain[0].getDate() + n);
        if (newDate < xDomain[1].getTime()) {
          xDomain[1].setMonth(xDomain[0].getMonth());
          xDomain[1].setDate(xDomain[0].getDate() + n);
        } else {
          return;
        }
      } else if (s === "m") {
        let newDate: any = (new Date(this.format(xDomain[0]))).setMonth(xDomain[0].getMonth() + n);
        if (newDate < xDomain[1].getTime()) {
          xDomain[1].setMonth(xDomain[0].getMonth() + n);
        } else {
          return;
        }
      } else if (s === "all") {
        xDomain = d3.extent(this.data, (c: any) => c.date);
        this.brushContainer.select(".brush").call(this.brush.move, this.xScale.range());
      }

      this.xScale.domain(xDomain);
      this.container.selectAll(".bar-group")
        .transition().duration(this.duration)
        .attr("transform", (d: any) => "translate(" + (this.xScale(d.date) - this.xScaleOrdinalState.bandwidth() / 2) + ",0)");
      this.container.select(".axis-x").transition().duration(this.duration).call(this.xAxis);
      this.container.select(".date-range").text(this.format(new Date(xDomain[0])) + "   -   " + this.format(new Date(xDomain[1])));
      this.updateAxisStyle();
    });
  }

  private create() {
    this.margin = { top: 95, bottom: 45, left: 50, right: 50 };
    this.marginBrush = { top: 40, bottom: 30, left: 50, right: 50 };
    if (this.options.isLegend) {
      if (this.options.legendPosition === 'left') {
        this.margin.left = 150;
        this.marginBrush.left = 150;
      } else if (this.options.legendPosition === 'right') {
        this.margin.right = 150;
        this.marginBrush.right = 150;
      }
    }
    this.duration = this.options.duration || 1000;
    this.width = (this.element.offsetWidth || 350) - this.margin.left - this.margin.right;
    this.height = (this.element.offsetHeight || 240) - this.margin.top - this.margin.bottom;
    this.heightBrush = (this.element.offsetHeight || 240) - this.height - this.marginBrush.top - this.marginBrush.bottom - this.margin.bottom;

    this.xScale = d3.scaleTime().range([0, this.width]);
    this.xScaleOrdinalState = d3.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.xScaleOrdinal = d3.scaleBand().rangeRound([0, this.xScaleOrdinalState.bandwidth()]).padding(0);
    this.yScale = d3.scaleLinear().range([this.height, 0]);
    this.xScaleBrush = d3.scaleTime().range([0, this.width]);
    this.colors = (!!this.options.dataColors && this.options.dataColors.range().length >= this.data.values.length) ? this.options.dataColors : d3.scaleOrdinal().range(["rgb(0, 136, 191)", "rgb(152, 179, 74)", "rgb(246, 187, 66)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]);
    this.xAxis = d3.axisBottom(this.xScale);
    this.xAxisBrush = d3.axisBottom(this.xScaleBrush);
    this.yAxis = d3.axisLeft(this.yScale);


    this.svg = d3.select(this.element).append('svg')
      .attr('id', 'bar-svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.svg.append("rect")
      .attr('class', 'background-bar-svg')
      .style('fill',  'transparent')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.tooltip = d3.select(this.element).append('div').attr('class', 'd3-tooltip-wrapper d3-hidden');

    this.svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("class", "clip-path")
      .attr("width", this.width)
      .attr("height", this.height);


    this.container = this.svg.append('g')
      .attr('class', 'container')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);


    this.brushContainer = this.svg.append("g")
      .attr("class", "container-brush")
      .attr('transform', `translate(${this.marginBrush.left}, ${this.marginBrush.top})`);


    this.container.append('g')
      .attr('class', 'bar-container')
      .style('clip-path', 'url(#clip)');
    this.brushContainer.append('g')
      .attr('class', 'bar-brush-container');


    this.container.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${0}, ${this.height})`);

    this.container.append('g')
      .attr('class', 'axis axis-y');

    this.brushContainer.append('g')
      .attr('class', 'axis axis-x-brush')
      .attr('transform', `translate(${0}, ${this.heightBrush})`);

    this.container.append("text")
      .attr('class', 'axis-y-label')
      .style("font-size", this.options.textColor || "12px")
      .style("font-family", '"myverdana"')
      .style("fill", this.options.textColor || "#000")
      .attr("text-anchor", "middle")
      .attr('transform', `translate(${(-30)}, ${(this.height / 2)})rotate(-90)`)
      .text(this.options.yAxisLabel || "");

    this.container.append("text")
      .attr('class', 'axis-x-label')
      .style("font-size", this.options.textColor || "12px")
      .style("font-family", '"myverdana"')
      .style("fill", this.options.textColor || "#000")
      .attr("text-anchor", "middle")
      .attr('transform', `translate(${(this.width / 2)}, ${(this.height + this.margin.bottom - 8)})`)
      .text(this.options.xAxisLabel || "");

    this.container.append("text")
      .attr('class', 'date-range')
      .style("font-size", this.options.textColor || "12px")
      .style("font-family", '"myverdana"')
      .style("fill", this.options.textColor || "#000")
      .attr("text-anchor", "start")
      .attr('transform', `translate(${(0)}, ${(this.height + this.margin.bottom - 8)})`)
      .text("");

    this.brush = d3.brushX()
      .extent([[0, 0], [this.width, this.heightBrush]])
      .on("brush end", () => {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
        let s = d3.event.selection || this.xScaleBrush.range();
        let xDomain = s.map(this.xScaleBrush.invert, this.xScaleBrush);
        this.xScale.domain(xDomain);
        this.container.selectAll(".bar-group")
          .transition().duration(this.duration)
          .attr("transform", (d: any) => "translate(" + (this.xScale(d.date) - this.xScaleOrdinalState.bandwidth() / 2) + ",0)");
        this.container.select(".axis-x").transition().duration(this.duration).call(this.xAxis);
        this.container.select(".date-range").text(this.format(new Date(xDomain[0])) + "   -   " + this.format(new Date(xDomain[1])));
        this.svg.select(".zoom").call(this.zoom.transform, d3.zoomIdentity
          .scale(this.width / (s[1] - s[0]))
          .translate(-s[0], 0));
        this.updateAxisStyle();
      });

    this.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [this.width, this.height]])
      .extent([[0, 0], [this.width, this.height]])
      .on("zoom", () => {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
        let t = d3.event.transform;
        let xDomain = t.rescaleX(this.xScaleBrush).domain();
        this.xScale.domain(xDomain);
        this.container.selectAll(".bar-group")
          .transition().duration(this.duration)
          .attr("transform", (d: any) => "translate(" + (this.xScale(d.date) - this.xScaleOrdinalState.bandwidth() / 2) + ",0)");
        this.container.select(".axis-x").transition().duration(this.duration).call(this.xAxis);
        this.brushContainer.select(".brush").call(this.brush.move, this.xScale.range().map(t.invertX, t));
        this.container.select(".date-range").text(this.format(new Date(xDomain[0])) + "   -   " + this.format(new Date(xDomain[1])));
        this.updateAxisStyle();
      });

    this.brushContainer.append("g")
      .attr("class", "brush")
      .call(this.brush)
      .call(this.brush.move, this.xScale.range());

    this.legend = this.svg.append('g').attr("class", "legend-container")

    this.svg.append("rect")
      .attr("class", "zoom")
      .style("fill", "none")
      .style("cursor", "move")
      .style("pointer-events", "all")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.createSaveDropdown();
    this.createZoomDropdown();

    this.svg.selectAll(".selection").style("stroke-width", 0);//in d3.js
    this.svg.selectAll(".overlay").style("fill", "none");//in d3.js
  } // create


  private updateSize() {
    this.width = (this.element.offsetWidth || 360) - this.margin.left - this.margin.right;
    //this.height = (this.element.offsetHeight || 240) - this.margin.top - this.margin.bottom;
    this.heightBrush = (this.element.offsetHeight || 240) - this.height - this.marginBrush.top - this.marginBrush.bottom - this.margin.bottom;
    this.svg
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.svg.select(".zoom")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.svg.select(".background-bar-svg")
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.svg.select(".clip-path")
      .attr("width", this.width)
      .attr("height", this.height);
    this.svg.select('.save-container')
      .selectAll(".save-text")
      .attr("x", (d: any, i: number) => this.width - i * this.saveTextWidth);

    this.container.select(".date-range")
      .attr('transform', `translate(${(0)}, ${(this.height + this.margin.bottom - 8)})`);
    this.container.select(".axis-y-label")
      .attr("transform", "translate(" + (-30) + "," + (this.height / 2) + ")rotate(-90)");
    this.container.select(".axis-x-label")
      .attr('transform', `translate(${(this.width / 2)}, ${(this.height + this.margin.bottom - 8)})`);

    this.xScale.range([0, this.width]);
    this.yScale.range([this.height, 0]);
    this.xScaleBrush.range([0, this.width]);
    this.xScaleOrdinalState.rangeRound([0, this.width]);
    this.xScaleOrdinal.rangeRound([0, this.xScaleOrdinalState.bandwidth()])

    this.container.select(".axis-x").call(this.xAxis);
    this.container.select(".axis-y").call(this.yAxis);
    this.brushContainer.select(".axis-x-brush").call(this.xAxisBrush);
  } // updateSize


  private update() {
    let xDomain = d3.extent(this.data, (c: any) => c.date);
    this.container.select(".date-range").text(this.format(new Date(xDomain[0])) + "   -   " + this.format(new Date(xDomain[1])));
    this.colors = (!!this.options.dataColors && this.options.dataColors.range().length >= this.data.values.length) ? this.options.dataColors : d3.scaleOrdinal().range(["rgb(0, 136, 191)", "rgb(152, 179, 74)", "rgb(246, 187, 66)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]);
    this.xScaleOrdinalState.domain(this.data.map((d: any) => d.id));
    this.xScale.domain(xDomain);
    this.xScaleBrush.domain(xDomain);


    if (this.typeIsGrouped) {
      let yDomain = [
        d3.min(this.data, function (c: any): any {
          return d3.min(c.values, function (d: any): Number {
            return d.value;
          });
        }),
        d3.max(this.data, (c: any): any => {
          return d3.max(c.values, (d: any): Number => {
            return d.value;
          });
        })
      ];
      this.yScale.domain(yDomain);//this.data[1].values
      this.xScaleOrdinal.domain(this.data[1].values.map((d: any) => { return d.key; })).rangeRound([0, this.xScaleOrdinalState.bandwidth()]);//needed//this.keys
      //d3.extent(this.data[1].values, (d:any) => { return d.key; }) - error

      let barGroup = this.container.select('.bar-container').selectAll(".bar-group")
        .data(this.data);
      barGroup.exit().remove();
      barGroup.enter().append("g")
        .classed('bar-group', true);

      let update = this.container.selectAll('.bar-group').selectAll('.bar')
        .data((d: any) => d.values);
      update.exit().remove();
      this.container.selectAll('.bar')
        .transition().duration(this.duration)
        .attr("x", (d: any, i: number) => this.xScaleOrdinal(d.key))
        .attr("width", this.xScaleOrdinal.bandwidth())
        .attr("y", (d: any) => this.yScale(d.value))
        .attr("height", (d: any) => this.height - this.yScale(d.value))
        .style('fill', (d: any, i: number) => this.colors(d.i));
      update
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr("x", (d: any, i: number) => this.xScaleOrdinal(d.key))
        .attr("width", this.xScaleOrdinal.bandwidth())
        .attr("y", (d: any) => this.yScale(d.value))
        .attr("height", (d: any) => this.height - this.yScale(d.value))
        .style('stroke', 'none')
        .style('stroke-width', '1px')
        .style('fill', (d: any, i: number) => this.colors(d.i));

    } else {
      this.data.map((bar: any, i: number) => {
        bar.values.map((c: any, j: number) => {
          c.y0 = j === 0 ? 0 : this.data[i].values[j - 1].value + this.data[i].values[j - 1].y0;
        });
      });
      let yDomain = [
        0,
        d3.max(this.data, (c: any): any => {
          return d3.max(c.values, (d: any): Number => {
            return d.value + d.y0;
          });
        })
      ];
      this.yScale.domain(yDomain);
      this.xScaleOrdinal.domain([this.data[0].values[0].key]).rangeRound([0, this.xScaleOrdinalState.bandwidth()]);//needed

      let barGroup = this.container.select('.bar-container').selectAll(".bar-group")
        .data(this.data);
      barGroup.exit().remove();
      barGroup.enter().append("g")
        .classed('bar-group', true);

      let update = this.container.selectAll('.bar-group').selectAll('.bar')
        .data((d: any) => d.values);
      update.exit().remove();
      this.container.selectAll('.bar')
        .transition().duration(this.duration)
        .attr("x", (d: any, i: number) => this.xScaleOrdinal(this.data[0].values[0].key))
        .attr("width", this.xScaleOrdinal.bandwidth())
        .attr("y", (d: any) => this.yScale(d.value + d.y0))
        .attr("height", (d: any) => (this.yScale(d.y0) - this.yScale(d.value + d.y0)))
        .style('fill', (d: any, i: number) => this.colors(d.i));
      update
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr("x", (d: any, i: number) => this.xScaleOrdinal(this.data[0].values[0].key))
        .attr("width", this.xScaleOrdinal.bandwidth())
        .attr("y", (d: any) => this.yScale(d.value + d.y0))
        .attr("height", (d: any) => (this.yScale(d.y0) - this.yScale(d.value + d.y0)))
        .style('stroke', 'none')
        .style('stroke-width', '1px')
        .style('fill', (d: any, i: number) => this.colors(d.i));

    }

    this.container.selectAll(".bar-group")
      .transition().duration(this.duration)
      .attr("transform", (d: any) => "translate(" + (this.xScale(d.date) - this.xScaleOrdinalState.bandwidth() / 2) + ",0)");//

    this.container.select(".axis-x").transition().duration(this.duration).call(this.xAxis);
    this.container.select(".axis-y").transition().duration(this.duration).call(this.yAxis);
    this.brushContainer.select(".axis-x-brush").transition().duration(this.duration).call(this.xAxisBrush);



    if (this.options.isLegend) {
      let leftPadding = 0;
      let topPadding = 45;//for dropdown
      let rectSize = 10;
      let xPosition = 0;
      if (this.options.legendPosition === 'left') {
        xPosition = 0;
        d3.select(this.element).select('.select').style("left", 0).style("top", "95px").style("right", "initial").style("bottom", "initial");
      } else if (this.options.legendPosition === 'right') {
        xPosition = this.width + this.margin.left - leftPadding;
        d3.select(this.element).select('.select').style("left", this.width + this.margin.left + "px").style("top", "95px").style("right", "initial").style("bottom", "initial");
      }
      let updateLegendRect = this.legend.selectAll('.legend-rect')
        .data(this.data[1].values);
      updateLegendRect.exit().remove();
      this.legend.selectAll('.legend-rect').transition().duration(this.duration)
        .attr('x', xPosition)
        .attr('y', (d: any, i: number) => this.margin.top + i * rectSize * 2 + topPadding)
        .attr('width', rectSize)
        .attr('height', rectSize)
        .style('fill', (d: any, i: number) => this.colors(i));
      updateLegendRect
        .enter()
        .append('rect')
        .attr('class', 'legend-rect')
        .attr('x', xPosition)
        .attr('y', (d: any, i: number) => this.margin.top + i * rectSize * 2 + topPadding)
        .attr('width', rectSize)
        .attr('height', rectSize)
        .style('fill', (d: any, i: number) => this.colors(i));

      let updateLegendText = this.legend.selectAll('.legend-text')
        .data(this.data[1].values);
      updateLegendText.exit().remove();
      this.legend.selectAll('.legend-text').transition().duration(this.duration)
        .attr('x', xPosition + rectSize + 2)
        .attr('y', (d: any, i: number) => this.margin.top + (i * rectSize * 2) + 9 + topPadding)
        .text((d: any) => d.key);
      updateLegendText
        .enter()
        .append('text')
        .attr('class', 'legend-text')
        .style("font-size", this.options.textColor || "12px")
        .style("text-anchor", "start")
        .style("fill", this.options.textColor || "#000")
        .style("font-family", '"myverdana"')
        .attr('x', xPosition + rectSize + 2)
        .attr('y', (d: any, i: number) => this.margin.top + (i * rectSize * 2) + 9 + topPadding)
        .text((d: any) => d.key);
    }

    this.brushContainer.select(".brush")
      .call(this.brush)
      .call(this.brush.move, this.xScale.range());

    this.container.select(".focus").remove();
    let focus = this.container.append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus.append("line")
      .attr("class", "x")
      .style("stroke", this.options.textColor || "#000")
      .style("stroke-dasharray", "3,3")
      .attr("y1", 0)
      .attr("y2", this.height);

    focus.append("line")
      .attr("class", "y")
      .style("stroke", this.options.textColor || "#000")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5)
      .attr("x1", this.width)
      .attr("x2", this.width);

    let mousemove = (that: any) => {
      const y0 = d3.mouse(that)[1];
      const y1 = this.yScale.invert(y0).toFixed(2);
      const date = d3.mouse(that)[0];
      focus.select(".x")
        .attr("transform", `translate(${date},0)`)
        .attr("y2", this.height);
      focus.select(".y")
        .attr("transform", `translate(${this.width * -1},${y0})`)
        .attr("x2", this.width + this.width);

      const xPosition = date + this.margin.left + 10;
      const yPosition = y0 + this.margin.top + 10;
      let info: string = '<hr>';
      let datetime: string = '';
      const x0 = this.xScale.invert(d3.mouse(that)[0]);
      const i = this.bisectDate(this.data, x0, 1);
      const d0 = this.data[i - 1];
      const d1 = this.data[i];
      if ((!d0 || !d0.date) || (!d1 || !d1.date)) {
        return;
      }
      const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      // console.log(d);
      if (d.hide) {
        return;
      }
      d.values.map((c: any) => {
        info = info + `<p>key: ${c.key}</p><p>value: ${c.value.toFixed(2)}</p><hr>`;
      });
      datetime = d.id;
      this.tooltip.classed('d3-hidden', false)
        .html(`<div class="d3-tooltip-content"><p class="d3-date">date: ${datetime}</p>${info}</div>`);
      this.tooltip.attr('style', `left:${xPosition}px;top:${yPosition}px`);
    }

    this.svg.select(".zoom")
      .on("mouseover", () => {
        this.tooltip.classed('d3-hidden', false);
        focus.style("display", null);
      })
      .on("mouseout", () => {
        this.tooltip.classed('d3-hidden', true);
        focus.style("display", "none");
      })
      .on("mousemove", function () {
        let that = this;
        mousemove(that);
      });
    this.updateAxisStyle();
  } // update

  private updateAxisStyle() {
    this.svg.selectAll(".axis path")
      .style('stroke', this.options.textColor || '#000');
    this.svg.selectAll(".axis line")
      .style('stroke', this.options.textColor || '#000');
    this.svg.selectAll(".axis text")
      .style('fill', this.options.textColor || '#000')
      .style("font-family", '"myverdana"');
    this.svg.selectAll("#bar-svg text")
      .style("font-family", '"myverdana"');
  }
}