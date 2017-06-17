import { Component, OnInit, AfterViewInit, OnChanges, ViewChild, AfterViewChecked, ElementRef, ViewEncapsulation, Input } from '@angular/core';
import * as d3 from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { DatasetService } from '../services/dataset-service';

import { Daterangepicker } from 'ng2-daterangepicker';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import * as moment from 'moment';

@Component({
  moduleId: module.id,
  selector: 'area-chart',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(window:resize)': 'onResize($event)'
  }
})

export class AreaComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() public options: any = {};
  @Input() private dataset: Array<any>;
  private chartId: any;
  private element: any;
  private isData: any = false;
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
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;
  private legend: any;
  private area: any;
  private radius: number;
  private formatDatapicker: any = d3.timeFormat("%m/%d/%y");
  private format: any = d3.timeFormat("%m/%d/%y %H:%M:%S");//"%Y-%m-%d %H:%M:%S"
  private parseDate: any = d3.timeParse("%m/%d/%y %H:%M:%S");
  private bisectDate = d3.bisector((d: any) => d.date).left;
  private saveTextWidth: number = 30;
  private zoomTextWidth: number = 30;
  private brush: any;
  private brushContainer: any;
  private areaBrush: any;
  private xScaleBrush: any;
  private yScaleBrush: any;
  private xAxisBrush: any;
  private marginBrush: any;
  private heightBrush: number;
  private zoom: any;
  private uniqueClipPathId = "area-clip-" + Date.now();
  private subscription: any;

  public mainInput = {
    start: moment().subtract(12, 'month'),
    end: moment().subtract(6, 'month')
  }


  constructor(
    private datasetService: DatasetService,
    private elementRef: ElementRef,
    private daterangepickerOptions: DaterangepickerConfig
  ) {
    let native = elementRef.nativeElement;
    this.chartId = native.getAttribute("data-id") || "area-chart-id-" + Date.now();

    this.daterangepickerOptions.settings = {
      locale: { format: 'MM/DD/YY' },
      alwaysShowCalendars: false,
      // ranges: {
      //   'Last Month': [moment().subtract(1, 'month'), moment()],
      //   'Last 3 Months': [moment().subtract(4, 'month'), moment()],
      //   'Last 6 Months': [moment().subtract(6, 'month'), moment()],
      //   'Last 12 Months': [moment().subtract(12, 'month'), moment()],
      // }
    };
  }

  public ngOnInit() {// we can use this.options

    let native = this.elementRef.nativeElement;
    this.element = this.chartContainer.nativeElement;
    d3.select(this.element).attr("id", this.chartId);

    let subscribe: any = native.getAttribute("data-subscribe");
    if (!subscribe) {
      this.isData = false;
      d3.select("#" + this.chartId).append('p')
        .attr('class', 'message')
        .text('No data!');
      return;
    }

    this.subscription = this.datasetService[subscribe].subscribe((initData: any) => {
      if (!initData) {
        return;
      }
      this.element = this.chartContainer.nativeElement;
      d3.select(this.element).attr("id", this.chartId);
      if (initData) {
        this.isData = true;
        d3.select("#" + this.chartId).selectAll('.message').remove();
      } else {
        this.isData = false;
        d3.select("#" + this.chartId).append('p')
          .attr('class', 'message')
          .text('No data!');
        return;
      }
      this.initData = initData;
      this.keys = d3.nest().key((d: any) => d.port).entries(initData);
      this.selectedKey = this.keys[0].key;
      const isDropDown = native.getAttribute("data-dropdown") || "false";
      if (isDropDown === 'true') {
        this.createKeyDropdown();
      }
      this.run();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public ngAfterViewInit() {
    this.margin = { top: 95, bottom: 45, left: 50, right: 50 };
    this.marginBrush = { top: 40, bottom: 30, left: 50, right: 50 };
    // if (this.options.isLegend){
    //   if (this.options.legendPosition==='left') {
    //     this.margin.left = 150;
    //     this.marginBrush.left = 150;
    //   } else if (this.options.legendPosition==='right') {
    //     this.margin.right = 150;
    //     this.marginBrush.right = 150;
    //   }
    // }
    // d3.select(this.element).selectAll('.daterange-picker').style("left", this.margin.left+"px");
  }

  public ngOnChanges() {
    if (this.dataset) {
      this.isData = true;
      d3.select("#" + this.chartId).selectAll('.message').remove();
    } else {
      this.isData = false;
      d3.select("#" + this.chartId).append('p')
        .attr('class', 'message')
        .text('No data!');
      return;
    }

    if (this.svg && (this.dataset || this.isData)) {
      this.initData = this.dataset;
      this.keys = d3.nest().key((d: any) => d.port).entries(this.dataset);
      this.selectedKey = this.keys[0].key;
      this.run();
      this.update();
    }
  }


  private selectedDate(value: any) {
    let xDomain = [value.start._d, value.end._d];
    this.xScale.domain(xDomain);
    this.container.selectAll(".area").transition().duration(this.duration).attr("d", (d: any): any => this.area(d.history))
    this.container.select(".axis-x").transition().duration(this.duration).call(this.xAxis);
    this.container.select(".date-range").text(this.format(new Date(xDomain[0])) + "   -   " + this.format(new Date(xDomain[1])));
    this.svg.selectAll(".axis text").style('fill', this.options.textColor || '#999');
  }

  private run() {
    //d3.keys(initData);this.data = d3.values(initData);
    this.data = (this.keys.filter((d: any) => d.key === this.selectedKey))[0];
    this.data.values.map((object: any, i: number) => {
      object.history.map((d: any, j: number) => {
        d.date = this.parseDate(d.clock);
        d.value = +d.value;
        d.y0 = i === 0 ? 0 : this.data.values[i - 1].history[j].value + this.data.values[i - 1].history[j].y0;
      });
    });
    if (!this.svg && this.data) { this.create(); this.update(); }
    if (this.svg && (this.dataset || this.isData)) { this.update(); }
  }


  onResize(event: any) {
    if (this.svg && this.data) {
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
    d3.select("#" + this.chartId).select('.select').remove();
    var select = d3.select("#" + this.chartId).append('select')
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
      saveSvgAsPng(document.getElementById("area-svg"), `area_ + ${Date.now()}.${type}`, { scale: 10 });
    }
    let saveJson = (type: string) => {
      let a = document.createElement('a');
      a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(JSON.stringify(this.initData)));
      a.setAttribute('download', `area_ + ${Date.now()}.json`);
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
      a.setAttribute('download', `area_ + ${Date.now()}.csv`);
      a.click();
    }

    let saveText = [
      { name: 'png', callback: saveImage },
      { name: 'jpeg', callback: saveImage },
      { name: 'json', callback: saveJson },
      { name: 'csv', callback: saveCsv }
    ];

    d3.select("#" + this.chartId).select('.save-select').remove();
    var select = d3.select("#" + this.chartId).append('select')
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

    d3.select("#" + this.chartId).select('.zoom-select').remove();
    var select = d3.select("#" + this.chartId).append('select')
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
      .style("fill", this.options.textColor || "#000")
      .style("cursor", "pointer")
      .text((d: any) => d);
    select.on("change", (e: any) => {
      let z = select.property("value");//select.node().value + "";
      let xDomain: any = this.xScale.domain();
      const n = +z.replace(/[^0-9\.]+/g, "");
      const s = z.replace(/[^A-Za-z\.]+/g, "");
      if (s === "M") {
        const newDate: any = (new Date(this.format(xDomain[0]))).setMinutes(xDomain[0].getMinutes() + n);
        if (newDate < xDomain[1].getTime()) {
          xDomain[1].setMonth(xDomain[0].getMonth());
          xDomain[1].setDate(xDomain[0].getDate());
          xDomain[1].setHours(xDomain[0].getHours());
          xDomain[1].setMinutes(xDomain[0].getMinutes() + n);
        } else {
          return;
        }
      } else if (s === "H") {
        const newDate: any = (new Date(this.format(xDomain[0]))).setHours(xDomain[0].getHours() + n);
        if (newDate < xDomain[1].getTime()) {
          xDomain[1].setMonth(xDomain[0].getMonth());
          xDomain[1].setDate(xDomain[0].getDate());
          xDomain[1].setHours(xDomain[0].getHours() + n);
        } else {
          return;
        }
      } else if (s === "d") {
        const newDate: any = (new Date(this.format(xDomain[0]))).setDate(xDomain[0].getDate() + n);
        if (newDate < xDomain[1].getTime()) {
          xDomain[1].setMonth(xDomain[0].getMonth());
          xDomain[1].setDate(xDomain[0].getDate() + n);
        } else {
          return;
        }
      } else if (s === "m") {
        const newDate: any = (new Date(this.format(xDomain[0]))).setMonth(xDomain[0].getMonth() + n);
        if (newDate < xDomain[1].getTime()) {
          xDomain[1].setMonth(xDomain[0].getMonth() + n);
        } else {
          return;
        }
      } else if (s === "all") {
        xDomain = [
          d3.min(this.data.values, function (c: any): any {
            return d3.min(c.history, function (d: any): Number {
              return d.date;
            });
          }),
          d3.max(this.data.values, (c: any): any => {
            return d3.max(c.history, (d: any): Number => {
              return d.date;
            });
          })
        ];
        this.brushContainer.select(".brush").call(this.brush.move, this.xScale.range());
      }

      this.xScale.domain(xDomain);
      this.container.selectAll(".area").transition().duration(this.duration).attr("d", (d: any): any => this.area(d.history))
      this.container.select(".axis-x").transition().duration(this.duration).call(this.xAxis);
      this.container.select(".date-range").text(this.format(new Date(xDomain[0])) + "   -   " + this.format(new Date(xDomain[1])));
      this.updateAxisStyle();
    });
  }


  private create() {
    this.margin = { top: 80, bottom: 45, left: this.options.axisMarginForNumbers || 50, right: this.options.axisMarginForNumbers || 50 };
    this.marginBrush = {
      top: 25, bottom: 30, left: this.options.axisMarginForNumbers || 50,
      right: this.options.axisMarginForNumbers || 50
    };
    if (this.options.isLegend) {
      if (this.options.legendPosition === 'left') {
        this.margin.left = 150;
        this.marginBrush.left = 150;
      } else if (this.options.legendPosition === 'right') {
        this.margin.right = 150;
        this.marginBrush.right = 150;
      }
    }
    d3.select("#" + this.chartId).selectAll('.daterange-picker').style("left", this.margin.left + "px");

    this.duration = this.options.duration || 1000;

    this.width = (this.element.offsetWidth || 360) - this.margin.left - this.margin.right;
    this.height = (this.element.offsetHeight || 240) - this.margin.top - this.margin.bottom;
    this.heightBrush = (this.element.offsetHeight || 240) - this.height - this.marginBrush.top - this.marginBrush.bottom - this.margin.bottom;

    this.xScale = d3.scaleTime().range([0, this.width]);;
    this.yScale = d3.scaleLinear().range([this.height, 0]);
    this.xScaleBrush = d3.scaleTime().range([0, this.width]);
    this.yScaleBrush = d3.scaleLinear().range([this.heightBrush, 0]);
    this.colors = (!!this.options.dataColors && this.options.dataColors.range().length >= this.data.values.length) ? this.options.dataColors : d3.scaleOrdinal().range(["rgb(0, 136, 191)", "rgb(152, 179, 74)", "rgb(246, 187, 66)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]);
    this.xAxis = d3.axisBottom(this.xScale);
    this.xAxisBrush = d3.axisBottom(this.xScaleBrush);
    this.yAxis = d3.axisLeft(this.yScale);

    this.area = d3.area()
      .curve(this.options.curve || d3.curveLinear)
      .x((d: any) => {
        return this.xScale(d.date) || 0;
      })
      .y0((d: any) => {
        return this.yScale(d.y0) || 0;
      })
      .y1((d: any) => {
        return this.yScale(d.value + d.y0) || 0;
      });
    this.areaBrush = d3.area()
      .curve(this.options.curve || d3.curveLinear)
      .x((d: any) => {
        return this.xScale(d.date) || 0;
      })
      .y0((d: any) => {
        return this.yScaleBrush(d.y0) || 0;
      })
      .y1((d: any) => {
        return this.yScaleBrush(d.value + d.y0) || 0;
      });


    this.svg = d3.select("#" + this.chartId).append('svg')
      .attr('id', 'area-svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.svg.append("rect")
      .attr("class", "background-area-svg")
      .style('fill','transparent')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.tooltip = d3.select("#" + this.chartId).append('div').attr('class', 'd3-tooltip-wrapper d3-hidden');

    this.svg.append("defs").append("clipPath")
      .attr("id", this.uniqueClipPathId)
      .append("rect")
      .attr("class", "clip-path")
      .attr("width", this.width)
      .attr("height", this.height);

    this.container = this.svg.append('g')
      .attr('class', 'container')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.brushContainer = this.svg.append("g")
      .attr("class", "container-brush")
      .attr('transform', `translate(${this.marginBrush.left}, ${this.marginBrush.top+10})`);


    this.container.append('g')
      .attr('class', 'area-container');
    this.brushContainer.append('g')
      .attr('class', 'area-brush-container');

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
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        let s = d3.event.selection || this.xScaleBrush.range();
        let xDomain = s.map(this.xScaleBrush.invert, this.xScaleBrush);
        this.xScale.domain(xDomain);
        this.container.selectAll(".area").transition().duration(this.duration).attr("d", (d: any): any => this.area(d.history))
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
        this.container.selectAll(".area").transition().duration(this.duration).attr("d", (d: any): any => this.area(d.history))
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
    this.height = (this.element.offsetHeight || 240) - this.margin.top - this.margin.bottom;
    this.heightBrush = (this.element.offsetHeight || 240) - this.height - this.marginBrush.top - this.marginBrush.bottom - this.margin.bottom;
    this.svg
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.svg.select(".zoom")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.svg.select(".background-area-svg")
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
    d3.select("#" + this.chartId).selectAll('.daterange-picker').style("left", this.margin.left + "px");

    this.xScale.range([0, this.width]);
    this.yScale.range([this.height, 0]);
    this.xScaleBrush.range([0, this.width]);
    this.yScaleBrush.range([this.heightBrush, 0]);


    this.container.select(".axis-x").call(this.xAxis);
    this.container.select(".axis-y").call(this.yAxis);
    this.brushContainer.select(".axis-x-brush").call(this.xAxisBrush);
  } // updateSize


  private update() {
    const xMin = d3.min(this.data.values, function (c: any): any {
      return d3.min(c.history, function (d: any): Number {
        return d.date;
      });
    });
    const xMax = d3.max(this.data.values, (c: any): any => {
      return d3.max(c.history, (d: any): Number => {
        return d.date;
      });
    });
    const yMax = d3.max(this.data.values, (c: any): any => {
      return d3.max(c.history, (d: any): Number => {
        return d.value + d.y0;
      });
    });
    const yMin = 0;
    const xDomain = [xMin, xMax];
    const yDomain = [yMin, yMax];
    this.container.select(".date-range").text(this.format(new Date(xDomain[0])) + "   -   " + this.format(new Date(xDomain[1])));
    this.colors = (!!this.options.dataColors && this.options.dataColors.range().length >= this.data.values.length) ? this.options.dataColors : d3.scaleOrdinal().range(["rgb(0, 136, 191)", "rgb(152, 179, 74)", "rgb(246, 187, 66)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]);
    this.xScale.domain(xDomain);
    this.yScale.domain(yDomain);
    this.xScaleBrush.domain(xDomain);
    this.yScaleBrush.domain(yDomain);

    this.container.select(".axis-x").transition().duration(this.duration).call(this.xAxis);
    this.container.select(".axis-y").transition().duration(this.duration).call(this.yAxis);
    this.brushContainer.select(".axis-x-brush").transition().duration(this.duration).call(this.xAxisBrush);


    let update = this.container.select('.area-container').selectAll('.area')
      .data(this.data.values);
    update.exit().remove();
    this.container.selectAll('.area')
      .transition().duration(this.duration)
      .attr("d", (d: any): any => this.area(d.history))
      .style('stroke', (d: any, i: number) => this.colors(i));
    update
      .enter()
      .append('path')
      .attr('class', 'area')
      .attr("id", (d: any, i: number): any => `area-${i}`)
      .attr("d", (d: any): any => this.area(d.history))
      .style('stroke', 'none')
      .style('stroke-width', '0px')
      .style('clip-path', `url(#${this.uniqueClipPathId})`)
      .style('fill', (d: any, i: number) => this.colors(i));
    // .transition().duration(this.duration)
    // .delay((d:any, i:number) => i * 10)
    // .attr("d", (d:any):any => this.area(d.history))
    // .style('fill', (d:any, i:number) => this.colors(i));


    let updateBrush = this.brushContainer.select('.area-brush-container')
      .selectAll('.area-brush')
      .data(this.data.values);
    updateBrush.exit().remove();
    this.brushContainer.selectAll('.area-brush')
      .transition().duration(this.duration)
      .attr("d", (d: any): any => this.areaBrush(d.history))
      .style('stroke', (d: any, i: number) => this.colors(i));
    updateBrush
      .enter()
      .append('path')
      .attr('class', 'area-brush')
      .attr("d", (d: any): any => this.areaBrush(d.history))
      .style('fill', 'none')
      .style('stroke-width', '1px')
      .style('clip-path', `url(#${this.uniqueClipPathId})`)
      .style('stroke', (d: any, i: number) => this.colors(i));



    if (this.options.isLegend) {
      let leftPadding = 0;
      let topPadding = 25;//for dropdown
      let rectSize = 10;
      let xPosition = 0;
      if (this.options.legendPosition === 'left') {
        xPosition = 0;
        d3.select("#" + this.chartId).select('.select').style("left", 0).style("top",
          this.margin.top + "px").style("right", "initial").style("bottom", "initial");
      } else if (this.options.legendPosition === 'right') {
        xPosition = this.width + this.margin.left - leftPadding;
        d3.select("#" + this.chartId).select('.select').style("left", this.width +
          this.margin.left + "px").style("top", this.margin.top + "px").style("right", "initial").style("bottom", "initial");
      }
      let updateLegendRect = this.legend.selectAll('.legend-rect')
        .data(this.data.values);
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
        .data(this.data.values);
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
      // .on("mouseover", (d:any, i:number) => {
      //   this.svg.select(`#area-${i}`).style('fill-opacity', 0.5);
      // })
      // .on("mouseout", (d:any, i:number) => {
      //   this.svg.select(`#area-${i}`).style('fill-opacity', 1);
      // });
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
      // let xPosition = d3.event.pageX+10;
      // let yPosition = d3.event.pageY-this.margin.top-this.heightBrush-this.marginBrush.top-this.marginBrush.bottom-20;
      let info: string = '<hr>';
      let datetime: string = '';
      const x0 = this.xScale.invert(d3.mouse(that)[0]);
      this.data.values.map((item: any, k: number) => {
        const i = this.bisectDate(this.data.values[k].history, x0, 1);
        const d0 = this.data.values[k].history[i - 1];
        const d1 = this.data.values[k].history[i];
        if ((!d0 || !d0.date) || (!d1 || !d1.date)) {
          return;
        }
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        info = info + `<p>key: ${item.key}</p><p>value: ${d.value.toFixed(2)}</p><hr>`;
        datetime = d.clock;
      });
      this.tooltip.classed('d3-hidden', false)
        .html(`<div class="d3-tooltip-content"><p class="d3-date">date: ${datetime}</p>${info}</div>`);
      // let box = this.tooltip.node().getBoundingClientRect();//this.tooltip.node().getBBox();
      // xPosition = d3.mouse(that)[0];
      // yPosition =d3.mouse(that)[1] - - box.height;//
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
  } // end update

  private updateAxisStyle() {
    this.svg.selectAll(".axis path")
      .style('stroke', this.options.textColor || '#000');
    this.svg.selectAll(".axis line")
      .style('stroke', this.options.textColor || '#000');
    this.svg.selectAll(".axis text")
      .style('fill', this.options.textColor || '#000')
      .style("font-family", '"myverdana"');
    this.svg.selectAll("#area-svg text")
      .style("font-family", '"myverdana"');
  }
}