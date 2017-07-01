
import { Component, OnInit, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { DatasetService } from '../services/dataset-service';
import { Daterangepicker, DaterangePickerComponent, DaterangepickerConfig } from 'ng2-daterangepicker';
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
  @ViewChild('chart') private chartContainer: ElementRef;
  @ViewChild(DaterangePickerComponent) private picker: DaterangePickerComponent;
  private currentBrushRange: any;
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
  private yAxisTickWidth: number = 0;
  private yAxisLabelPadding: number = -40;
  private brush: any;
  private brushContainer: any;
  private xScaleBrush: any;
  private xAxisBrush: any;
  private marginBrush: any;
  private heightBrush: number;
  private legendRectSize: number = 12;
  private legendPaddingBottom: number = 5;
  private legendHeight: number = this.legendRectSize + this.legendPaddingBottom;
  private legendSize: number = 0;
  private legendPositionIsRight: boolean = true;
  private legendPaddingLeft: number = 5;
  private uniqueClipPathId = "bar-clip-"+Date.now();
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
    this.element = this.chartContainer.nativeElement;
    d3.select(this.element).attr("id", this.chartId);

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

      this.run(true);
    });
    this.onResize(true);
  }

  private selectedDate(value: any) {
    let xDomain = [value.start._d, value.end._d];
    this.xScale.domain(xDomain);
    this.container.selectAll(".bar-group")
      .transition().duration(this.duration)
      .attr("transform", (d: any) => "translate(" + (this.xScale(d.date) - this.xScaleOrdinalState.bandwidth() / 2) + ",0)");
    this.container.select(".axis-x").transition().duration(this.duration).call(this.xAxis);
    this.svg.selectAll(".axis text").style('fill', this.options.textColor || "#000");
    this.svg.select(".date-range").text(this.format(new Date(xDomain[0])) + "   -   " + this.format(new Date(xDomain[1])));
  }

  private changeBarType(value: any) {
    // this.typeLabel = value.target.checked;
    this.typeIsGrouped = !this.typeIsGrouped;
    if (this.type === 'grouped') {
      this.type = 'stacked';
    } else {
      this.type = 'grouped';
    }
    this.run(false)
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private run(isResize:boolean) {
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

    if (!this.svg && this.data) { 
      this.create();
      if (this.options.isZoom) {
        this.svg.select(".zoom").call(this.zoom); 
      }
    }
    if (this.svg && this.data) { this.update(); }
    this.onResize(isResize);
  }


  onResize(event: any) {
    if (this.container) {
      if (event){
        this.updateSize();
      }
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
      this.run(true);
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
    
    d3.select("#"+this.chartId).selectAll('.export-main a')
      .on("click", function() {
        let text = d3.select(this).text();
        saveText.map((d:any)=>{
          if (d.name === text){
            d.callback(d.name);
          }
        })
      });
  }

  private createZoomDropdown() {
    let zoomText = ["5M", "15M", "30M", "1H", "2H", "3H", "6H", "12H", "1d", "3d", "7d", "14d", "1m", "2m", "all"];
    let imageSize:number = 23;
    let isVisible:boolean = true;
    let slider: any;
    let width:number = zoomText.length * 23;
    width = width>this.width ? this.width : width;
    let height:number = 45;
    let radius:number = 14;
    let hue:Function;

    d3.select("#"+this.chartId).select('.zoom-select').remove();
    let g:any = d3.select("#"+this.chartId).select("svg").append('g')
      .attr("class", "zoom-select")
      .attr('transform', `translate(${this.margin.left+imageSize}, ${this.marginBrush.top})`)
      .style("pointer-events", "bounding-box")
      .on("mouseenter", (d:any) => {
        slider.style("display", isVisible ? null : "none");
        rect.style("display", isVisible ? null : "none");
        isVisible=!isVisible;
      })
      .on("mouseleave", () => {
        slider.style("display", "none");
        rect.style("display", "none");
        isVisible = true;
      });

    let image = g.append('image')
      .style("pointer-events", "all")
      .style("cursor", "pointer")
      .style("width", imageSize)
      .style("height", imageSize)
      .attr("x", 0)
      .attr("y", -imageSize-1)
      .attr("xlink:href", "assets/img/stopwatch.svg")
      .on("click", () => {
        slider.style("display", isVisible ? null : "none");
        rect.style("display", isVisible ? null : "none");
        isVisible=!isVisible;
      });

    let rect = g
      .append('rect')
      .attr("y", 0)
      .attr("x", 0)
      .style("width", width + radius*2-6)
      .style("height", height)
      .style("fill", this.options.backgroundColor || "#000")
      .style("pointer-events", "none")
      .style("display", "none");
    
    let x:any = d3.scaleLinear()
      .domain([0, zoomText.length-1])
      .range([0, width])
      .clamp(true);
  
    slider = g.append("g")
      .style("display", "none")
      .attr("class", "slider")
      .attr("transform", "translate(" + (imageSize/2-1) + "," + height / 2 + ")");
  
    slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr("class", "track-inset")
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr("class", "track-overlay")
      .call(d3.drag()
        .on("start.interrupt", function() {
          slider.interrupt();
        })
        .on("start drag", function() {
          hue(x.invert(d3.event.x));
        }));
  
    slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + radius*2 + ")")
      .selectAll("text")
      .data(x.ticks(zoomText.length))
      .enter().append("text")
      .attr("x", x)
      .attr("text-anchor", "middle")
      .text(function(d:any, i:number) {
        return zoomText[i];
      });
  
    var handle = slider.insert("rect", ".track-overlay")
      .attr("class", "zoom-handle")
      .attr("y", -(radius+6)/2)
      .attr("x", -radius/2)
      // .attr("rx", 4)
      // .attr("ry", 4)
      .attr("width", radius)
      .attr("height", radius+6);
      // .attr("x", 0);
      // .attr("r", radius);
  
    hue = (h:any) => {
      // console.log(Math.round(h));
      // handle.attr("cx", x(Math.round(h)));
      handle.attr("x", x(Math.round(h))-radius/2);
      // g.style("background-color", d3.hsl(h, 0.8, 0.8));
      let z = zoomText[Math.round(h)];//select.property("value");//select.node().value + "";
     
      let xDomain: any = this.xScale.domain();
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
      this.svg.select(".date-range").text(this.format(new Date(xDomain[0])) + "   -   " + this.format(new Date(xDomain[1])));
      this.updateAxisStyle();
    }
     g.selectAll("text")
      .style("font-size", "11px")//this.options.textSize || "12px")
      .style("font-family", '"Helvetica Neue",Helvetica,Arial,sans-serif')
      .style("fill", this.options.textColor || "#999")
  }

private setDatarangepicker(xDomain:any){
    if (this.picker && this.picker.datePicker){
      this.picker.datePicker.setStartDate(this.formatDatapicker(xDomain[0]));//06/20/17
      this.picker.datePicker.setEndDate(this.formatDatapicker(xDomain[1]))
    }
  }
  private create() {
    this.margin = { top: 80, bottom: 45, left: 55, right: 25};
    this.marginBrush = { top: 25, bottom: 30, left: 55, right: 25};
    
     d3.select("#"+this.chartId).selectAll('.daterange-picker').style("left", this.margin.left+"px");

   
    this.width = (this.element.offsetWidth || 350) - this.margin.left - this.margin.right;
    this.height = (this.element.offsetHeight || 240) - this.margin.top - this.margin.bottom;
    this.heightBrush = (this.element.offsetHeight || 240) - this.height - this.marginBrush.top - this.marginBrush.bottom - this.margin.bottom;
    this.currentBrushRange = [0, this.width];

    d3.select("#"+this.chartId).select('.daterange-picker')
    .style("left", this.margin.left+"px ! important")
    .on("click", () => {
      let svg:any;
      d3.selectAll(".daterangepicker").select(".daterangepicker-svg").remove();
      let daterangepicker:any = d3.selectAll(".daterangepicker");
      let width:number = this.width > 564 ? 472 : 230;
      let height:number = 25;
      let x:any = d3.scaleTime().range([0, width]).domain(this.xScale.domain());
      let xAxis:any = d3.axisBottom(x).ticks(4);
      let brush:any = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("brush", ()=>{
          var s:any = d3.event.selection;
          let xDomain:any = s.map(x.invert, x);
          this.setDatarangepicker(xDomain);
          this.currentBrushRange = [s[0]*this.width/width, s[1]*this.width/width];
          this.brushContainer.select(".brush").call(this.brush.move, this.currentBrushRange);
          this.brushContainer.select(".resize--w").attr("x",this.currentBrushRange[0] - 25/2);
          this.brushContainer.select(".resize--e").attr("x",this.currentBrushRange[1] - 25/2);
          svg.select(".resize---w").attr("x",s[0] - 25/2);
          svg.select(".resize---e").attr("x",s[1] - 25/2);
        });


      svg = daterangepicker.append("div")
        .attr("class", "daterangepicker-svg")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
      
      let context:any = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(0,0)"); 
      context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
      let range:any = [this.currentBrushRange[0]*width/this.width, this.currentBrushRange[1]*width/this.width];
      let brashContainer:any = context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, range);//, x.range()

    brashContainer.selectAll(".resize")//resize
      .data([{type:"w"}, {type:"e"}])
      .enter()
      .insert("image", "rect.handle")
      .attr("class",(d:any)=>{
        return "resize resize---"+d.type;//d.type==="w" ? -25/2 : this.width - 25/2;
      })
      .style("pointer-events", "none")
      .style("fill", "none")
      .style("stroke-width", 1)
      .style("stroke", "#000")
      .style("width", 25)
      .style("height", 25)
      .attr("x", (d:any)=>{
        return d.type==="w" ? range[0] - 25/2 : range[1] - 25/2;
      })
      .attr("y", 0)
      .attr("xlink:href", "assets/img/dragicon.svg");
    });

    this.xScale = d3.scaleTime().range([0, this.width]);
    this.xScaleOrdinalState = d3.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.xScaleOrdinal = d3.scaleBand().rangeRound([0, this.xScaleOrdinalState.bandwidth()]).padding(0);
    this.yScale = d3.scaleLinear().range([this.height, 0]);
    this.xScaleBrush = d3.scaleTime().range([0, this.width]);
     this.colors = (!!this.options.dataColors && this.options.dataColors.range().length >= this.data[1].values.length) ? this.options.dataColors : d3.scaleLinear().domain([0, this.data[1].values.length]).range(<any[]>['green', 'blue']);
    this.xAxis = d3.axisBottom(this.xScale).ticks(6);
    this.xAxisBrush = d3.axisBottom(this.xScaleBrush);
    this.yAxis = d3.axisLeft(this.yScale).tickFormat(d3.format(".1f")).ticks(4);


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
      .attr('transform', `translate(${this.marginBrush.left}, ${this.marginBrush.top})`);

    this.container.append('g')
      .attr('class', 'bar-container')
      .style('clip-path', `url(#${this.uniqueClipPathId})`);
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
      .style("font-size", this.options.textSize || "12px")
      .style("font-family", '"Helvetica Neue",Helvetica,Arial,sans-serif')
      .style("fill", this.options.textColor || "#999")
       .attr("text-anchor", "middle")
      .attr('transform', `translate(${this.yAxisLabelPadding}, ${(this.height/2)})rotate(-90)`)
      .text(this.options.yAxisLabel || "");

    this.container.append("text")
      .attr('class', 'axis-x-label')
      .style("font-size", this.options.textSize || "12px")
      .style("font-family", '"Helvetica Neue",Helvetica,Arial,sans-serif')
      .style("fill", this.options.textColor || "#999")
      .attr("text-anchor", "middle")
      .attr('transform', `translate(${(this.width/2)}, ${(this.height+33)})`)
      .text(this.options.xAxisLabel || "");


    this.svg.append("text")
      .attr('class', 'date-range')
      .style("font-size", this.options.textSize || "12px")
      .style("font-family", '"Helvetica Neue",Helvetica,Arial,sans-serif')
      .style("fill", this.options.textColor || "#999")
      .attr("text-anchor", "start")
      .attr('transform', `translate(${this.options.isDropdown ? 205 : 105}, 16)`)
      .text("");


    this.brush = d3.brushX()
      .extent([[0, 0], [this.width, this.heightBrush]])
      .on("brush end", () => {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
        let s = d3.event.selection || this.xScaleBrush.range();
        this.currentBrushRange = s;
        let xDomain = s.map(this.xScaleBrush.invert, this.xScaleBrush);
        this.setDatarangepicker(xDomain);
        this.xScale.domain(xDomain);
        this.container.selectAll(".bar-group")
          .transition().duration(this.duration)
          .attr("transform", (d:any) => "translate(" + (this.xScale(d.date)-this.xScaleOrdinalState.bandwidth()/2) + ",0)");
        this.container.select(".axis-x").transition().duration(this.duration).call(this.xAxis);
        this.svg.select(".date-range").text(this.format(new Date(xDomain[0]))+"   -   "+this.format(new Date(xDomain[1])));
        this.svg.select(".zoom").call(this.zoom.transform, d3.zoomIdentity
          .scale(this.width / (s[1] - s[0]))
          .translate(-s[0], 0));
        this.updateAxisStyle();
        this.brushContainer.select(".resize--w").attr("x",this.currentBrushRange[0] - 25/2);
        this.brushContainer.select(".resize--e").attr("x",this.currentBrushRange[1] - 25/2);
      });

    this.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [this.width, this.height]])
      .extent([[0, 0], [this.width, this.height]])
      .on("zoom", () => {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
        let t = d3.event.transform;
        let xDomain = t.rescaleX(this.xScaleBrush).domain();
        this.setDatarangepicker(xDomain);
        this.xScale.domain(xDomain);
        this.container.selectAll(".bar-group")
          .transition().duration(this.duration)
          .attr("transform", (d:any) => "translate(" + (this.xScale(d.date)-this.xScaleOrdinalState.bandwidth()/2) + ",0)");
        this.container.select(".axis-x").transition().duration(this.duration).call(this.xAxis);
        this.currentBrushRange = this.xScale.range().map(t.invertX, t);
        this.brushContainer.select(".brush").call(this.brush.move, this.currentBrushRange);
        this.svg.select(".date-range").text(this.format(new Date(xDomain[0]))+"   -   "+this.format(new Date(xDomain[1])));
        this.updateAxisStyle();
        this.brushContainer.select(".resize--w").attr("x",this.currentBrushRange[0] - 25/2);
        this.brushContainer.select(".resize--e").attr("x",this.currentBrushRange[1] - 25/2);
      });
    
    // https://bl.ocks.org/Fil/013d52c3e03aa7b90f71db99eace95af
    // https://bl.ocks.org/mbostock/4349545
    let brashContainer = this.brushContainer.append("g")
      .attr("class", "brush")
      .call(this.brush)
      .call(this.brush.move, this.xScale.range());
    brashContainer.selectAll(".resize")//resize
      .data([{type:"w"}, {type:"e"}])
      .enter()
      .insert("image", "rect.handle")
      .attr("class",(d:any)=>{
        return "resize resize--"+d.type;//d.type==="w" ? -25/2 : this.width - 25/2;
      })
      .style("pointer-events", "none")
      .style("fill", "none")
      .style("stroke-width", 1)
      .style("stroke", "#000")
      .style("width", 25)
      .style("height", 25)
      .attr("x", (d:any)=>{
        return d.type==="w" ? -25/2 : this.width - 25/2;
      })
      .attr("y", 0)
      .attr("xlink:href", "assets/img/dragicon.svg");

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
    if (this.options.isDropdown || false) {
      this.createKeyDropdown();
    }

    this.svg.selectAll(".selection").style("stroke-width", 0);//in d3.js
    this.svg.selectAll(".overlay").style("fill", "none");//in d3.js
  } // create


  private updateSize() {
    this.width = (this.element.offsetWidth || 360) - this.margin.left - this.margin.right;
    this.height = (this.element.offsetHeight || 240) - this.margin.top - this.margin.bottom;
    this.heightBrush = (this.element.offsetHeight || 240) - this.height -this.marginBrush.top - this.marginBrush.bottom - this.margin.bottom;
    if (this.width < 100){
      this.width = 100
    }
    this.zoom
      .translateExtent([[0, 0], [this.width, this.height]])
      .extent([[0, 0], [this.width, this.height]]);
    this.brush.extent([[0, 0], [this.width, this.heightBrush]]);

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
   
    this.container
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.brushContainer
      .attr('transform', `translate(${this.marginBrush.left}, ${this.marginBrush.top})`);
    this.container.select('.axis-x')
      .attr('transform', `translate(${0}, ${this.height})`);
    this.container.select(".axis-y-label")
      .attr('transform', `translate(${this.yAxisLabelPadding}, ${(this.height/2)})rotate(-90)`);
    this.container.select(".axis-x-label")
      .attr('transform', `translate(${(this.width/2)}, ${(this.height+33)})`);

    d3.select("#"+this.chartId).select('.daterange-picker')
      .style("left", this.margin.left+"px");
    // d3.select("#"+this.chartId).select('.save-select')
    //   .attr('transform', `translate(${this.margin.left+this.width}, ${this.marginBrush.top})`);
    d3.select("#"+this.chartId).select('.zoom-select')
       .style("left", (this.margin.left - 1)+"px");

    this.xScale.range([0, this.width]);
    this.yScale.range([this.height, 0]);
    this.xScaleBrush.range([0, this.width]);
    this.xScaleOrdinalState.rangeRound([0, this.width]);
    this.xScaleOrdinal.rangeRound([0, this.xScaleOrdinalState.bandwidth()]);
     if (this.options.isLegend) {
      this.legend
        .attr('transform', `translate(${this.legendPositionIsRight ? this.margin.left + this.width : this.margin.left }, ${this.legendPositionIsRight ? this.margin.top : this.margin.top + this.height + 20+20})`);
    }
    d3.select("#"+this.chartId).select('.select')
      .style("font-size", this.options.textSize || "12px");
    //   .style("left", (this.legendPositionIsRight ? this.margin.left + this.width : this.margin.left)+"px").style("top", (this.legendPositionIsRight ? this.margin.top : this.margin.top + this.height + 20+25)+"px").style("right", "initial").style("bottom", "initial");


  } // updateSize


  private update() {
    d3.select("#"+this.chartId).select('.switch-wrapper-bar')
      .style("font-size", this.options.textSize || "12px")
      .style("color", this.options.textColor || "#999")
      .style("font-family", '"Helvetica Neue",Helvetica,Arial,sans-serif');
    // this.duration = this.options.duration <= 0 ? 0 : 1000;
    let xDomain = d3.extent(this.data, (c:any) => c.date );
    this.svg.select(".date-range")
      .text(this.format(new Date(xDomain[0]))+"   -   "+this.format(new Date(xDomain[1])));
    this.colors = (!!this.options.dataColors && this.options.dataColors.range().length >= this.data[1].values.length) ? this.options.dataColors : d3.scaleLinear().domain([0, this.data[1].values.length]).range(<any[]>['green', 'blue']);
    this.xScaleOrdinalState.domain(this.data.map((d:any) => d.id));
    this.xScale.domain(xDomain);
    this.xScaleBrush.domain(xDomain);
    
if (this.options.isLegend) {
      let updateLegendRect = this.legend.selectAll('.legend-rect')
        .data(this.data[1].values);
      updateLegendRect.exit().remove();
      this.legend.selectAll('.legend-rect')
        .attr('x', 0)
        .attr('y', (d:any, i:number) => ((i * this.legendHeight)) )
        .attr("width", this.legendRectSize)
        .attr("height", this.legendRectSize)
        .style('fill', (d:any, i:number) => this.colors(i));
      updateLegendRect
        .enter()
        .append('rect')
        .attr('class', 'legend-rect')
        .attr('x', 0)
        .attr('y', (d:any, i:number) => ((i * this.legendHeight)) )
        .attr("width", this.legendRectSize)
        .attr("height", this.legendRectSize)
        .style('fill', (d:any, i:number) => this.colors(i));
    
      let updateLegendText = this.legend.selectAll('.legend-text')
        .data(this.data[1].values);
      updateLegendText.exit().remove();
      this.legend.selectAll('.legend-text')
        .attr('x', (d:any, i:number) => (this.legendPaddingLeft + this.legendRectSize))
        .attr('y', (d:any, i:number) => (5 + this.legendRectSize / 2 + (i * this.legendHeight)))
        .text((d:any) => d.key)
      updateLegendText
        .enter()
        .append('text')
        .attr('class', 'legend-text')
        .style("font-size", this.options.textSize || "12px")
        .style("text-anchor", "start")
        .style("fill", this.options.textColor || "#999")
        .style("font-family", '"Helvetica Neue",Helvetica,Arial,sans-serif')
        .attr('x', (d:any, i:number) => (this.legendPaddingLeft + this.legendRectSize))
        .attr('y', (d:any, i:number) => (5 + this.legendRectSize / 2 + (i * this.legendHeight)))
        .text((d:any) => d.key)
        .style('cursor', 'pointer')
        .on("click", (d:any, i:number) => {
          d._hide = d._hide ? !d._hide : true;
          this.svg.select(`#line-${i}`).style('opacity', d._hide ? 0 : 1);
        })
        .on("mouseover", (d:any, i:number) => {
          this.svg.select(`#line-${i}`).style('stroke-width', '2px');
        })
        .on("mouseout", (d:any, i:number) => {
          this.svg.select(`#line-${i}`).style('stroke-width', '1px');
        });

        setTimeout(()=>{
          let bbox = this.legend.node().getBBox();
          let box = Math.round(bbox.width);// for yAxisLabel
          if (box > this.legendSize) {
            this.legendSize = box + 10;
            if (this.legendSize * 5 > this.width){
              // this.legendSize = Math.round(bbox.height) + 40;//for tick
              this.legendPositionIsRight = false;
              this.margin.bottom = Math.round(bbox.height) + 45;
              this.margin.right = 25;
            } else {
              this.legendPositionIsRight = true;
              this.margin.right = this.legendSize;
              this.margin.bottom = 45;
            }
            this.onResize(true);
          }
        }, 10);
        this.duration = this.options.duration <= 0 ? 0 : 1000;
    } else {
      this.margin.right = 50;
      this.duration = this.options.duration <= 0 ? 0 : 1000;
    }
    
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