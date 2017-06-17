
import { Component, OnInit, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { DatasetService } from '../services/dataset-service';

@Component({
  moduleId: module.id,
  selector: 'pie-chart',
  templateUrl: 'pie.component.html',
  styleUrls: ['pie.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(window:resize)': 'onResize($event)'
  }
})

export class PieComponent implements OnInit {
  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() public options: any = {};
  private chartId: any;
  private element: any;
  private isData: any = true;
  private type: string;
  private typeIsPie: boolean;
  private typeLabelSelected: string = "";
  private typeLabelUnselected: string = "";
  private initData: any;
  private data: any;//data
  private keys: any[];
  private selectedKey: string;
  private margin: any;
  private svg: any;
  private tooltip: any;
  private container: any;
  private width: number;
  private widthWithoutLegend: number;
  private height: number;
  private duration: number;
  private durationSmall: number;
  private colors: any;
  private legendWidth: number = 0;
  private saveTextWidth: number = 30;
  // private focus: any;
  private d3Arc: any = d3.arc();
  private artContainer: any;
  private labelContainer: any;
  private d3Pie = d3.pie()
    .sort(null)
    .value((d: any) => d.value);
  private legendContainer: any;
  private legendRectSize: number = 12;
  private legendpacingBottom: number = 10;
  private legendpacingLeft: number = 10;
  private legendHeight: number = this.legendRectSize + this.legendpacingBottom;
  private enteringArcs: any;
  private labelsLine: any;
  private labelsCircle: any;
  private labelsText: any;
  private innerRadius: any;
  private outerRadius: any;
  private labelRadius: any;
  private subscription: any;


  constructor(private datasetService: DatasetService, private elementRef: ElementRef) {
  }

  public ngOnInit() {// we can use this.options
    let native = this.elementRef.nativeElement;
    this.chartId = native.getAttribute("data-id") || "chart-id-" + Date.now();
    this.type = native.getAttribute("data-type");
    if (this.type === 'pie') {
      this.typeIsPie = true;
      this.typeLabelSelected = 'Pie';
      this.typeLabelUnselected = 'Donut';
    } else if (this.type === 'donut') {
      this.typeIsPie = false;
      this.typeLabelSelected = 'Donut';
      this.typeLabelUnselected = 'Pie';
    }
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
      this.data = initData;
      // this.keys = d3.nest().key((d:any) => d.port).entries(initData);
      // this.selectedKey = this.keys[0].key;
      this.element = this.chartContainer.nativeElement;
      if (!this.isData) {
        d3.select("#" + this.chartId).append('p')
          .attr('class', 'message')
          .text('No data!');
      } else {
        d3.select("#" + this.chartId).select('.message').remove();
      }
      if (!this.svg) {
        this.create();
      }
      if (this.svg && this.isData) {
        this.d3Pie.padAngle(this.options.padAngle || 0)
        this.data = this.d3Pie(this.initData);//data
        this.update();
      }
      // this.createKeyDropdown();
      this.run();
    });
  }

  private changePieType(value: any) {
    // this.typeLabel = value.target.checked;
    this.typeIsPie = !this.typeIsPie;
    if (this.type === 'pie') {
      this.type = 'donut';
      this.innerRadius = 0; // / 5.3
    } else {
      this.type = 'pie';
      this.innerRadius = Math.round(this.widthWithoutLegend / (this.options.innerRadiusDivider || 5.0)); // / 5.3
    }
    this.d3Arc
      .cornerRadius(this.options.cornerRadius || 0)
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius);

    this.run();
  }

  private run() {
    this.data = this.d3Pie(this.initData);//data
    if (!this.svg && this.data) {
      this.d3Pie.padAngle(this.options.padAngle || 0);
      this.data = this.d3Pie(this.initData);//data
      this.create();
      this.update();
    }
    if (this.svg && this.data) { this.update(); }
  }


  onResize(event: any) {
    if (this.svg && this.data) {
      this.updateSize();
      this.update();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  private convertToCSV(objArray: string) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    array.map((object: any, i: number) => {
      if (i === 0) {
        let title = '';
        for (let index in object) {
          if (title != '') title += ','
          title += '"' + index + '"';
        }
        str += title + '\r\n';
      }

      let line = '';
      for (let index in object) {
        if (line != '') line += ','
        line += '"' + object[index] + '"';
      }
      str += line + '\r\n';
    });
    return str;
  }

  private createSaveDropdown() {
    let saveImage = (type: string) => {
      saveSvgAsPng(document.getElementById("pie-svg"), `pie_ + ${Date.now()}.${type}`, { scale: 10 });
    }
    let saveJson = (type: string) => {
      let a = document.createElement('a');
      a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(JSON.stringify(this.initData)));
      a.setAttribute('download', `pie_ + ${Date.now()}.json`);
      a.click();
    }
    let saveCsv = (type: string) => {
      // let json:any = [];
      // this.keys.map((keyObj:any) => {
      //   keyObj.values.map(function(valueObj:any):void{
      //     valueObj.history.map(function(obj:any):void{
      //       json.push({port:valueObj.port, ip:valueObj.ip, key:valueObj.key, clock:obj.clock, value:obj.value.toFixed(2)})
      //     });
      //   });
      // });
      let a = document.createElement('a');
      a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(this.convertToCSV(this.initData)));
      a.setAttribute('download', `pie_ + ${Date.now()}.csv`);
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
          s.callback(s.name);
        }
      })
    });

  }

  private create() {
    this.margin = { top: 0, bottom: 0, left: 0, right: 0 };
    this.duration = this.options.duration || 1000;
    if (this.options.isLegend) {
      this.legendWidth = 100;
    }
    this.widthWithoutLegend = Math.min((this.element.offsetWidth || 200) - this.legendWidth, this.element.offsetHeight || 200) - this.margin.left - this.margin.right;
    this.width = this.widthWithoutLegend + this.legendWidth + 45;//this.width > 500 ? 2 * this.width / 3 : this.width;
    this.height = this.widthWithoutLegend; //let box = legend.node().getBBox();
    // console.log(this.options.dataColors.range().length, !!this.options.dataColors, this.options.dataColors.range().length >= this.data.length);
    // this.colors = (!!this.options.dataColors && this.options.dataColors.range().length >= this.data.length) ? this.options.dataColors : d3.scaleLinear().domain([0, this.data.length]).range(<any[]>['red', 'blue']);

    this.outerRadius = Math.round(this.widthWithoutLegend / (this.options.outerRadiusDivider || 2.7)); // / 2.65
    this.labelRadius = Math.round(this.widthWithoutLegend / (this.options.labelRadiusDivider || 2.2)); // / 2.4

    if (this.typeIsPie) {
      this.innerRadius = Math.round(this.widthWithoutLegend / (this.options.innerRadiusDivider || 5.0)); // / 5.3
    } else {
      this.innerRadius = 0; // / 5.3
    }

    this.d3Arc
      .cornerRadius(this.options.cornerRadius || 0)
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius);

    this.svg = d3.select("#" + this.chartId).append('svg')
      .attr('id', 'pie-svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.svg.append("rect")
      .attr('class', 'background-pie-svg')
      .style('fill', 'transparent')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.tooltip = d3.select("#" + this.chartId).append('div').attr('class', 'd3-tooltip-wrapper d3-hidden');

    this.container = this.svg.append('g')
      .attr('class', 'container')
      .attr("transform", "translate(" + (this.height / 2 + (this.options.legendPosition === 'left' ? this.legendWidth : 0)) + "," + (this.height / 2) + ")");

    this.artContainer = this.container.append('g').attr('class', 'art-container');
    this.labelContainer = this.container.append('g').attr('class', 'labels-container');
    // this.legend = this.svg.append('g').attr("class", "legend-container") 
    this.legendContainer = this.svg.append('g').attr('class', 'legend-container"');
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence
    let filter = this.artContainer.append('defs').append('filter').attr('id', 'glow'),
      feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '1.0').attr('result', 'coloredBlur'),
      feMerge = filter.append('feMerge'),
      feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
      feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    this.createSaveDropdown();


  }// create


  private updateSize() {
    this.margin = { top: 0, bottom: 0, left: 0, right: 0 };
    this.duration = this.options.duration || 1000;
    this.widthWithoutLegend = Math.min((this.element.offsetWidth || 200) - this.legendWidth, this.element.offsetHeight || 200) - this.margin.left - this.margin.right;
    this.width = this.widthWithoutLegend + this.legendWidth;//this.width > 500 ? 2 * this.width / 3 : this.width;
    this.height = this.widthWithoutLegend; //let box = legend.node().getBBox();
    this.outerRadius = Math.round(this.widthWithoutLegend / (this.options.outerRadiusDivider || 2.7)); // / 2.65
    this.labelRadius = Math.round(this.widthWithoutLegend / (this.options.labelRadiusDivider || 2.2)); // / 2.4

    this.svg
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.container
      .attr("transform", "translate(" + (this.height / 2 + (this.options.legendPosition === 'left' ?
        this.legendWidth : 0)) + "," + (this.height / 2) + ")");
    this.svg.select(".background-pie-svg")
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.svg.select(".clip-path")
      .attr("width", this.width)
      .attr("height", this.height);
    this.svg.select('.save-container')
      .selectAll(".save-text")
      .attr("x", (d: any, i: number) => this.width - i * this.saveTextWidth);

  } // updateSize


  private update() {
    let that: this = this;
    this.colors = (!!this.options.dataColors && this.options.dataColors.range().length >= this.data.length) ? this.options.dataColors : d3.scaleOrdinal().range(["rgb(0, 136, 191)", "rgb(152, 179, 74)", "rgb(246, 187, 66)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]);

    if (this.typeIsPie) {
      this.innerRadius = Math.round(this.widthWithoutLegend / (this.options.innerRadiusDivider || 5.0)); // / 5.3
    } else {
      this.innerRadius = 0; // / 5.3
    }

    this.d3Arc
      .cornerRadius(this.options.cornerRadius || 0)
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius);

    this.legendContainer.transition().duration(this.duration).attr("transform", (d: any, i: number) => {
      return 'translate(' + (this.options.legendPosition === 'left' ?
        this.legendWidth / 4 : this.labelRadius * 2 + this.legendWidth / 4 + 20) + ',' +
        (this.height - this.data.length * this.legendHeight) / 2 + ')';
    });


    // Let's start drawing the arcs.
    this.enteringArcs = this.artContainer.selectAll('.wedge')
      .data(this.data);
    this.enteringArcs.exit().remove();
    this.artContainer.selectAll('.wedge').transition().duration(this.duration)
      .attr("id", (d: any, i: number) => "wedge-" + i)
      .attr("class", "wedge")
      .style("fill", (d: any, i: number) => this.colors(i))
      .style('stroke', (d: any, i: number) => this.colors(i))
      .attrTween("d", arcTween);
    this.enteringArcs
      .enter()
      .insert('path')
      .attr('class', 'wedge')
      .attr("id", (d: any, i: number) => "wedge-" + i)
      .attr("class", "wedge")
      .style("fill", (d: any, i: number) => this.colors(i))
      .style('stroke', (d: any, i: number) => this.colors(i))
      .on("mousemove", function (d: any) {
        that.enteringArcs.each(function (c: any, i: number) {
          // var element = d3.select(this);
          var flag = false;
          if (d.data.label === c.data.label) {
            flag = true;
          }
          that.svg.select("#label-line-" + i)
            .style("opacity", flag ? 1 : 0.1);
          // that.svg.select("#label-line-2-" + i)
          //   .style("opacity", flag ? 1 : 0.1);
          that.svg.select("#label-circle-" + i)
            .style("opacity", flag ? 1 : 0.1);
          that.svg.select("#label-text-" + i)
            .style("opacity", flag ? 1 : 0.3);
          that.svg.select("#legend-rect-" + i)
            .style("opacity", flag ? 1 : 0.3);
          that.svg.select("#legend-text-" + i)
            .style("opacity", flag ? 1 : 0.3);
          d3.select(this)
            .style("opacity", flag ? 1 : 0.3);
        });
        setTooltip(d);
      })
      .on("mouseleave", function () {
        that.enteringArcs.each(function (c: any, i: number) {
          that.svg.select("#label-line-" + i)
            .style("opacity", 1);
          // that.svg.select("#label-line-2-" + i)
          //   .style("opacity", 1);
          that.svg.select("#label-circle-" + i)
            .style("opacity", 1);
          that.svg.select("#label-text-" + i)
            .style("opacity", 1);
          that.svg.select("#legend-rect-" + i)
            .style("opacity", 1);
          that.svg.select("#legend-text-" + i)
            .style("opacity", 1);
          d3.select(this)
            .style("opacity", 1);
        });
        that.tooltip.classed("d3-hidden", true);
      })
      .transition().duration(this.duration)
      .delay((d: any, i: number) => i * 10)
      .attrTween("d", arcTween);


    function arcTween(a: any) {
      this._current = this._current || a;
      let i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function (t: any) {
        return that.d3Arc(i(t));
      };
    }

    // that.labelContainer.selectAll(".label-line-2").style("opacity", 0); //.classed("pie-hidden", true);
    // d3.selectAll(".label-text").classed("pie-hidden", true); //.style("opacity", 0);

    this.labelsLine = this.labelContainer.selectAll('.label-line')
      .data(this.data);
    this.labelsLine.exit().remove();
    this.labelContainer.selectAll('.label-line').transition().duration(0)
      .attr("class", "label-line")
      .attr("id", (d: any, i: number) => "label-line-" + i)
      .style("stroke", this.options.textColor || "#000")
      .attr("x1", (d: any, i: number) => this.d3Arc.centroid(d)[0])
      .attr("y1", (d: any, i: number) => this.d3Arc.centroid(d)[1])
      .attr("x2", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        const x = Math.cos(midAngle) * this.labelRadius;
        return x;
      })
      .attr("y2", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        const y = Math.sin(midAngle) * this.labelRadius;
        return y;
      });
    this.labelsLine
      .enter()
      .append('line')
      .attr("class", "label-line")
      .attr("id", (d: any, i: number) => "label-line-" + i)
      .style("stroke", this.options.textColor || "#000")
      .attr("x1", (d: any, i: number) => this.d3Arc.centroid(d)[0])
      .attr("y1", (d: any, i: number) => this.d3Arc.centroid(d)[1])
      .attr("x2", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        const x = Math.cos(midAngle) * this.labelRadius;
        return x;
      })
      .attr("y2", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        const y = Math.sin(midAngle) * this.labelRadius;
        return y;
      });

    this.labelsCircle = this.labelContainer.selectAll('.label-circle')
      .data(this.data);
    this.labelsCircle.exit().remove();
    this.labelContainer.selectAll('.label-circle').transition().duration(0)
      .attr("class", "label-circle")
      .attr("id", (d: any, i: number) => "label-circle-" + i)
      .style("fill", this.options.textColor || "#000")
      .attr("x", 0)
      .attr("x", 0)
      .attr("r", 4)
      .attr("transform", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        return "translate(" + this.d3Arc.centroid(d) + ")";
      });
    this.labelsCircle
      .enter()
      .append('circle')
      .attr("class", "label-circle")
      .attr("id", (d: any, i: number) => "label-circle-" + i)
      .style("fill", this.options.textColor || "#000")
      .attr("x", 0)
      .attr("x", 0)
      .attr("r", 4)
      .attr("transform", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        return "translate(" + this.d3Arc.centroid(d) + ")";
      });


    this.labelsText = this.labelContainer.selectAll('.label-text')
      .data(this.data);
    this.labelsText.exit().remove();
    this.labelContainer.selectAll('.label-text').transition().duration(0)
      .attr("class", "label-text")
      .attr("id", (d: any, i: number) => "label-text-" + i)
      .attr("x", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        const x = Math.cos(midAngle) * this.labelRadius;
        const sign = (x > 0) ? 1 : -1;
        const labelX = x + (5 * sign);
        return labelX;
      })
      .attr("y", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        const y = Math.sin(midAngle) * this.labelRadius;
        return y;
      })
      .style("text-anchor", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        const x = Math.cos(midAngle) * this.labelRadius;
        return (x > 0) ? "start" : "end";
      })
      .text((d: any) => d.data.value);
    this.labelsText
      .enter()
      .append('text')
      .attr("class", "label-text")
      .attr("id", (d: any, i: number) => "label-text-" + i)
      .style("font-size", this.options.textColor || "12px")
      .style("font-family", '"myverdana"')
      .style("fill", this.options.textColor || "#000")
      .attr("x", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        const x = Math.cos(midAngle) * this.labelRadius;
        const sign = (x > 0) ? 1 : -1;
        const labelX = x + (5 * sign);
        return labelX;
      })
      .attr("y", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        const y = Math.sin(midAngle) * this.labelRadius;
        return y;
      })
      .style("text-anchor", (d: any, i: number) => {
        const centroid = this.d3Arc.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        const x = Math.cos(midAngle) * this.labelRadius;
        return (x > 0) ? "start" : "end";
      })
      .text((d: any) => d.data.value);


    function relax() {
      let alpha = 0.5;
      let spacing = 18;
      let again = false;
      that.labelsText.each(function (d: any, i: number) {
        let a = this;
        let da = d3.select(a);
        let y1 = +da.attr("y");
        that.labelsText.each(function (d: any, j: number) {
          let b = this;

          if (a == b) return;
          let db = d3.select(b);

          if (da.attr("text-anchor") != db.attr("text-anchor")) return;

          let y2 = +db.attr("y");
          let deltaY = y1 - y2;

          if (Math.abs(deltaY) > spacing) return;

          again = true;
          let sign = deltaY > 0 ? 1 : -1;
          let adjust = sign * alpha;
          da.attr("y", (y1 + adjust));
          db.attr("y", (y2 - adjust));
        });
      });

      if (again) {
        let labelElements = that.labelsText._groups[0];
        that.labelsLine.attr("y2", (d: any, i: number) => {
          let labelForLine = d3.select(labelElements[i]);
          return labelForLine.attr("y");
        });
        setTimeout(relax, 20); //20
      } else {
        that.labelsText.each(function (d: any, i: number) {
          let da = d3.select(this);
          let y = that.labelsLine._groups[0][i].y2.baseVal.value; //+da.attr("y");
          // da.attr("y", (y > 0 ? (y - 8) : (y - 8)));
          // .style("fill", that.colors(i)); //.transition().duration(200)
        });

        // let labelsLine2 = that.labelContainer.selectAll('.label-line-2')
        //   .data(that.data);
        // labelsLine2.exit().remove();
        // that.labelContainer.selectAll('.label-line-2').transition().duration(0)
        //   .attr("class", "label-line-2")
        //   .attr("id", (d:any, i:number) => "label-line-2-" + i)
        //   .style("stroke", that.options.textColor || "#000")
        //   .attr("x1", (d:any, i:number) => that.labelsLine._groups[0][i].x2.baseVal.value)
        //   .attr("y1", (d:any, i:number) => that.labelsLine._groups[0][i].y2.baseVal.value)
        //   .attr("x2", (d:any, i:number) => {
        //     let value = that.labelsText._groups[0][i].textLength.baseVal.value + 5;
        //     if (value <= 5) { //for firefox
        //       value = d.data.value >= 10 ? 40 : 30;
        //     }
        //     let x2 = that.labelsLine._groups[0][i].x2.baseVal.value;
        //     return x2 > 0 ? x2 + value : x2 - value;
        //   })
        //   .attr("y2", (d:any, i:number) => that.labelsLine._groups[0][i].y2.baseVal.value);
        // labelsLine2
        //   .enter()
        //   .append('line')
        //   .attr("class", "label-line-2")
        //   .attr("id", (d:any, i:number) => "label-line-2-" + i)
        //   .style("stroke", that.options.textColor || "#000")
        //   .attr("x1", (d:any, i:number) => that.labelsLine._groups[0][i] ? that.labelsLine._groups[0][i].x2.baseVal.value : 0)
        //   .attr("y1", (d:any, i:number) => that.labelsLine._groups[0][i] ? that.labelsLine._groups[0][i].y2.baseVal.value : 0)
        //   .attr("x2", (d:any, i:number) => {
        //     if (!that.labelsText._groups[0][i]) { return; };
        //     let value = that.labelsText._groups[0][i].textLength.baseVal.value + 5;
        //     if (value <= 5) { //for firefox
        //       value = d.data.value >= 10 ? 40 : 30;
        //     }
        //     let x2 = that.labelsLine._groups[0][i].x2.baseVal.value;
        //     return x2 > 0 ? x2 + value : x2 - value;
        //   })
        //   .attr("y2", (d:any, i:number) => that.labelsLine._groups[0][i] ? that.labelsLine._groups[0][i].y2.baseVal.value : 0);

        //   // d3.selectAll(".label-text").style("opacity", 1);
        //   d3.selectAll(".label-line-2").style("opacity", 1);

      }
    }

    setTimeout(relax, this.duration);

    let setTooltip = (d: any) => {
      that.tooltip.classed('d3-hidden', false)
        .html(`<div class="d3-tooltip-content"><p class="d3-date">tooltip</p><p>${d.data.tooltip}</p></div>`);

      //let box = that.legendContainer.node().getBBox();
      that.tooltip
        .style("left", 0 + "px")
        // .style("left", (this.labelRadius * 2 + 130 + box.width) + "px")
        // .style("width", (this.width - (this.labelRadius * 2 + 130 + box.width)) + "px")
        .style("top", 0 + "px");
    }

    if (this.options.isLegend) {
      let updateLegendRect = this.legendContainer.selectAll('.legend-rect')
        .data(this.data);
      updateLegendRect.exit().remove();
      this.legendContainer.selectAll('.legend-rect').transition().duration(this.duration)
        .attr('x', (d: any, i: number) => (0))
        .attr('y', (d: any, i: number) => ((i * this.legendHeight)))
        .attr("width", this.legendRectSize)
        .attr("height", this.legendRectSize)// rx: legendRectSize,// ry: legendRectSize
        .style("fill", (d: any, i: number) => this.colors(i))
        .style('stroke', (d: any, i: number) => this.colors(i));
      updateLegendRect
        .enter()
        .append('rect')
        .attr("id", (d: any, i: number) => "legend-rect-" + i)
        .attr('class', 'legend-rect')
        .attr('x', (d: any, i: number) => (0))
        .attr('y', (d: any, i: number) => ((i * this.legendHeight)))
        .attr("width", this.legendRectSize)
        .attr("height", this.legendRectSize)// rx: legendRectSize,// ry: legendRectSize
        .style("fill", (d: any, i: number) => this.colors(i))
        .style('stroke', (d: any, i: number) => this.colors(i));

      let updateLegendText = this.legendContainer.selectAll('.legend-text')
        .data(this.data);
      updateLegendText.exit().remove();
      this.legendContainer.selectAll('.legend-text').transition().duration(this.duration)
        .attr('x', (d: any, i: number) => (this.legendpacingLeft + this.legendRectSize))
        .attr('y', (d: any, i: number) => (5 + this.legendRectSize / 2 + (i * this.legendHeight)))
        .text((d: any) => d.data.label);
      updateLegendText
        .enter()
        .append('text')
        .attr("id", (d: any, i: number) => "legend-text-" + i)
        .attr('class', 'legend-text')
        .style("font-size", this.options.textColor || "12px")
        .style("text-anchor", "start")
        .style("fill", this.options.textColor || "#000")
        .style("font-family", '"myverdana"')
        .attr('x', (d: any, i: number) => (this.legendpacingLeft + this.legendRectSize))
        .attr('y', (d: any, i: number) => (5 + this.legendRectSize / 2 + (i * this.legendHeight)))
        .text((d: any) => d.data.label);
    }


    this.svg.selectAll("#pie-svg text")
      .style("font-family", '"myverdana"');
  } // update


}