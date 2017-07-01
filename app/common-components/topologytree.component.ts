
import { Component, OnInit, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { DatasetService } from '../services/dataset-service';

@Component({
  moduleId: module.id,
  selector: 'topologytree-chart',
  templateUrl: './topologytree.component.html',
  styleUrls: ['./topologytree.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(window:resize)': 'onResize($event)'
  }
})

export class TopologytreeComponent implements OnInit {
  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() public options: any = {};
  private chartId: any;
  private element: any;
  private isData: any = false;
  private initData: any;
  private data: any;
  private root: any;
  private margin: any;
  private svg: any;
  private tooltip: any;
  private container: any;
  private width: number;
  private height: number;
  private duration: number = 0;
  private radius: number = 20;
  private range: number = 100;
  private saveTextWidth: number = 30;
  private simulation: any;
  private linkDasharray: any = {};
  private treemap: any;
  private zoom: any;

  constructor(private datasetService: DatasetService, private elementRef: ElementRef) {
    // let native = elementRef.nativeElement;
    // this.chartId = native.getAttribute("data-id") || "topo-chart-id-" + Date.now();
    this.linkDasharray.solid = "none";
    this.linkDasharray.dotted = "2,3";
    this.linkDasharray.dashed = "6,3";
  }

  public ngOnInit() {// we can use this.options
    let native = this.elementRef.nativeElement;
    this.chartId = native.getAttribute("data-id") || "topo-chart-id-" + Date.now();
    this.element = this.chartContainer.nativeElement;
    d3.select(this.element).attr("id", this.chartId);

    let subscribe: any = native.getAttribute("data-subscribe");
    if (!subscribe) {
      this.isData = false;
      return;
    }
    this.datasetService[subscribe].subscribe((initData: any) => {
      if (!initData) {
        return;
      }
      this.isData = true;
      this.initData = initData;
      this.data = initData;
      this.run();
    });
  }


  private run() {
    if (!this.svg && this.isData && this.data) {
      this.create();
      // Assigns parent, children, height, depth
      this.root = d3.hierarchy(this.data, function (d) {
        return d.children;
      });
      this.root.x0 = this.height / 2;
      this.root.y0 = 0;
      // console.log(this.options.depth);
      this.root.children.forEach((d: any) => {
        this.initCollapse(d);
      });
      this.updateSize();
      this.update(this.root);
      // this.update();
      return;
    }
    if (this.svg && this.isData) {
      this.root = d3.hierarchy(this.data, function (d) {
        return d.children;
      });
      // console.log(this.options.depth);
      this.root.children.forEach((d: any) => {
        this.initCollapse(d);
      });
      this.updateSize();
      this.update(this.root);
    }
  }


  onResize(event: any) {
    if (this.svg && this.isData) {
      this.updateSize();
      this.update(this.root);
    }
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

  // private createSaveDropdown() {
  //   let saveImage = (type: string) => {
  //     saveSvgAsPng(document.getElementById("topologytree-svg"), `topologytree_ + ${Date.now()}.${type}`, { scale: 10 });
  //   }
  //   let saveJson = (type: string) => {
  //     let a = document.createElement('a');
  //     a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(JSON.stringify(this.initData)));
  //     a.setAttribute('download', `topologytree_ + ${Date.now()}.json`);
  //     a.click();
  //   }
  //   let saveCsv = (type: string) => {
  //     let a = document.createElement('a');
  //     a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(this.convertToCSV(this.initData)));
  //     a.setAttribute('download', `topologytree_ + ${Date.now()}.csv`);
  //     a.click();
  //   }

  //   let saveText = [
  //     { name: 'png', callback: saveImage },
  //     { name: 'jpeg', callback: saveImage },
  //     { name: 'json', callback: saveJson },
  //     { name: 'csv', callback: saveCsv }
  //   ];

  // }

  private create() {
    let that = this;
    this.margin = { top: 0, bottom: 0, left: 0, right: 0 };
    this.width = (this.element.offsetWidth || 360) - this.margin.left - this.margin.right;
    this.height = (this.element.offsetHeight || 240) - this.margin.top - this.margin.bottom;
    this.duration = this.options.duration <= 0 ? 0 : 1000;
    this.zoom = d3.zoom()
      .scaleExtent([1 / 4, 5])
      .on("zoom", zoomed);

    this.svg = d3.select("#" + this.chartId).append('svg')
      .attr('id', 'topologytree-svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .call(this.zoom);

    this.svg.append("rect")
      .attr('class', 'background-topologytree-svg')
      .style('fill', this.options.backgroundColor || '#000')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)

    this.tooltip = d3.select("#" + this.chartId).append('div').attr('class', 'd3-tooltip-wrapper d3-hidden');

    function zoomed() {
      that.container.attr("transform", d3.event.transform);
    }

    // this.svg.append("defs").append("marker")
    //   .attr("id", "arrow")
    //   .attr("viewBox", "0 -5 10 10")
    //   .attr("refX", 9)
    //   .attr("refY", 0)
    //   .attr("markerWidth", 10)
    //   .attr("markerHeight", 10)
    //   .attr("orient", "auto")
    //   .style("fill", this.options.arrowColor || "#4393c3")
    //   .append("svg:path")
    //   .attr("d", "M0,-5L10,0L0,5");

    this.container = this.svg.append('g')
      .attr('class', 'container');
      // .attr('transform', `translate(${this.width/2}, ${this.radius*4})`);
    // this.zoom.transform = [this.width/2, this.radius*4];
    // d3.event.transform = [this.width/2, this.radius*4];
    
    this.treemap = d3.tree().nodeSize([this.width / 2 , this.radius * 4])//.size([this.width, this.height])
    // .separation(function (a, b) {
    //     return a.parent == b.parent ? 2 : 1;
    // });//http://jsfiddle.net/unrsdm4b/
// d3.tree - create a new tidy tree layout.
// tree - layout the specified hierarchy in a tidy tree.
// tree.size - set the layout size.
// tree.nodeSize - set the node size.
// tree.separation - set the separation between nodes.
  } // create

  private initCollapse(d: any) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach((c: any) => {
        this.initCollapse(c);
      });
       if (this.options.depth && d.depth >= this.options.depth){
        d.children = null;
      } else {
        if (!d.data.properties.visible){
          d.children = null;
        }
      } 
    }
  }

  // private collapse(d:any) {
  //   if(d.children) {
  //     d._children = d.children;
  //     d._children.forEach((c:any) => {
  //       this.collapse(c);
  //     });
  //     d.children = null;
  //   }
  // }

  private updateSize() {
    this.width = (this.element.offsetWidth || 360) - this.margin.left - this.margin.right;
    this.height = (this.element.offsetHeight || 240) - this.margin.top - this.margin.bottom;
    this.svg
      .transition().duration(this.duration)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    // this.container
    //   .transition().duration(this.duration)
    //   .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.svg.select(".background-topologytree-svg")
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.svg.select('.save-container')
      .selectAll(".save-text")
      .attr("x", (d: any, i: number) => this.width - i * this.saveTextWidth);

  } // updateSize

  // Creates a curved (diagonal) path from parent to the child nodes
  private diagonal(s: any, d: any) {
    let path;
    if (this.options.linkType && this.options.linkType === "straight"){//https://www.dashingd3js.com/svg-paths-and-d3js
      path = `M ${(s.x || 0)} ${(s.y || 0)}
          ${(d.x || 0)} ${(d.y || 0)}`
    } else {
      path = `M ${(s.x || 0)} ${(s.y || 0)}
        C ${(s.x || 0)} ${((s.y || 0) + (d.y || 0)) / 2},
          ${(d.x || 0)} ${((s.y || 0) + (d.y || 0)) / 2},
          ${(d.x || 0)} ${(d.y || 0)}`
    }
    return path
  }

  // Toggle children on click.
  private click(d: any) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    this.update(d);
  }

  private update(source: any) {//https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd       https://bl.ocks.org/d3noob/b024fcce8b4b9264011a1c3e7c7d70dc
    // var transform = d3.zoomTransform(this.container.node());
    // transform.scale(1);
    // transform.translate(0,0);
    this.svg
      .select('.background-topologytree-svg')
      .style('fill', this.options.backgroundColor || '#000');

    let that = this;
    let treeData = this.treemap(this.root);

    // Compute the new tree layout.
    let nodes = treeData.descendants();
    let links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach((d: any) => { d.y = d.depth * 180 });

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = this.container.selectAll('g.node')
      .data(nodes, (d: any, i: number) => {
        d.y = d.y + 50;
        return d.id || (d.id = ++i);
      });

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", (d: any) => {
        return "translate(" + (source.x0 || 0) + "," + (source.y0 || 0) + ")";
      })
      .on('click', (d: any) => {
        this.click(d);
      })
      .on("mousemove", (d: any) => {
        if (!this.options.nodeTooltipLabelFields) { return; }
        let text = "";
        this.options.nodeTooltipLabelFields.map((item: any) => {
          text = text + `<tr><td class="bold">${item}:</td><td>${d.data.properties[item] || ""}</td></tr>`
        });
        let coordinates = d3.mouse(that.svg.node());
        this.tooltip.classed("d3-hidden", false)
          .html(`<div class="d3-tooltip-content"><table class="table table-striped">${text}</table></div>`);//<p class="d3-date">tooltip</p>
        // let coord:any = d3.mouse(this);
        this.tooltip
          .style("left", (coordinates[0] + 10) + "px")
          .style("top", (coordinates[1] + 10) + "px");
      })
      .on("mouseleave", () => {
        this.tooltip.classed("d3-hidden", true);
      });

    // Add Circle for the nodes
    nodeEnter.append('circle')
      .attr('r', 1e-6)
      // .style("fill", (d:any) => {return d._children ? "lightsteelblue" : "#fff";});
      .attr('class', (d: any) => 'node-circle' + ' node-circle__id__' + d.id);

    nodeEnter.append('image')
      // .style("fill", (d:any) => { return d._children ? "lightsteelblue" : "#fff"; })
      .attr('class', (d: any) => 'node-image' + ' node-image__id__' + d.id)
      .attr('cursor', 'pointer');
    // Add labels for the nodes
    nodeEnter.append('text')
      .attr('class', (d: any) => 'node-label' + ' node-label__id__' + d.id)
      .style("text-anchor", "middle");
    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);
    // Transition to the proper position for the node
    nodeUpdate.transition()
      .duration(this.duration)
      .attr("transform", (d: any) => {
        return "translate(" + d.x + "," + d.y + ")";
      });
    // Update the node attributes and style
    nodeUpdate.select('.node-circle')
      // .style("fill", (d:any) => { return d._children ? "lightsteelblue" : "#fff"; })
      .attr('class', (d: any) => 'node-circle' + ' node-circle__id__' + d.id)
      .attr("r", (d: any) => d.data.properties.imageSize / 2 + this.options.circleStrokeWidth || 10)
      .style("fill", (d:any) => (d.children || d._children) ? (this.options.isChildren || 'lightsteelblue') : 'none')
      // .attr("fill", "none")
      .attr("stroke", (d: any) => d.data.properties.circleColor || "#fff")
      .attr("stroke-width", this.options.circleStrokeWidth || 10);
    nodeUpdate.select('.node-image')
      // .style("fill", (d:any) => { return d._children ? "lightsteelblue" : "#fff"; })
      .attr('class', (d: any) => 'node' + ' node__id__' + d.id)
      .attr("x", (d: any) => -d.data.properties.imageSize / 2)
      .attr("y", (d: any) => -d.data.properties.imageSize / 2)
      .attr("xlink:href", (d: any) => d.data.properties.imageSrc)
      .attr("height", (d: any) => d.data.properties.imageSize)
      .attr("width", (d: any) => d.data.properties.imageSize);
    nodeUpdate.select('.node-label')
      .attr('class', (d: any) => 'node-label' + ' node-label__id__' + d.id)
      .attr('y', '5')
      .style("text-anchor", "middle")
      .style("fill", this.options.nodeTextColor || "#4393c3")
      .style("font-family", '"Helvetica Neue",Helvetica,Arial,sans-serif')
      .style("font-size", this.options.nodeTextSize || "12px")
      .text((d: any) => this.options.nodeLabelField ? d.data.properties[this.options.nodeLabelField] : "");
    // Remove any exiting nodes
    var nodeExit = node.exit().transition()
      .duration(this.duration)
      .attr("transform", (d: any) => {
        return "translate(" + (source.x || 0) + "," + (source.y || 0) + ")";
      })
      .remove();
    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
      .attr('r', 1e-6);

    nodeExit.select('image')
      .attr('x', 1e-6)
      .attr('y', 1e-6)
      .attr('width', 1e-6)
      .attr('height', 1e-6);
    // On exit reduce the opacity of text labels
    nodeExit.select('text')
      .style('fill-opacity', 1e-6);
    

    // ****************** links section ***************************
    var linkInvisible = this.container.selectAll('.link-invisible')
      .data(links, (d:any) => {
        return d.id;
      });
    // Enter any new links at the parent's previous position.
    var linkInvisibleEnter = linkInvisible.enter().insert('path', "g")
      .attr("class", "link-invisible")
      .style("fill", "transparent")
      .style("stroke", "transparent")
      .style("stroke-width", 8)
      // .attr("marker-mid", "url(#arrow)")
      .attr('d', (d: any) => {
        var o = {
          x: source.x0,
          y: source.y0
        }
        return this.diagonal(o, o)
        })
      .on("mousemove", (d:any) => {
        if (!this.options.linkTooltioLabelFields) { return; } 
        let text="";
        this.options.linkTooltioLabelFields.map((item:any)=>{
          text = text + `<tr><td class="bold">${item}:</td><td>${d.data.linkProperties ? d.data.linkProperties[item] : ""}</td></tr>`
        });
        let coordinates = d3.mouse(this.svg.node());
        this.tooltip.classed("d3-hidden", false)
        .html(`<div class="d3-tooltip-content"><table class="table table-striped">${text}</table></div>`);//<p class="d3-date">tooltip</p>
        that.tooltip
          .style("left", (coordinates[0]+10) + "px")
          .style("top", (coordinates[1]+10) + "px");
        })
      .on("mouseleave", () => {
        this.tooltip.classed("d3-hidden", true);
      });
    // UPDATE
    var linkInvisibleUpdate = linkInvisibleEnter.merge(linkInvisible);
    // Transition back to the parent element position
    linkInvisibleUpdate.transition()
      .duration(this.duration)
      .attr('d', (d: any) => {
        return this.diagonal(d, d.parent)
      });
    // Remove any exiting links
    var linkInvisibleExit = linkInvisible.exit().transition()
      .duration(this.duration)
      .attr('d', (d: any) => {
        var o = {
          x: source.x,
          y: source.y
        }
        return this.diagonal(o, o)
      })
      .remove();
    
    // Update the links...
    var link = this.container.selectAll('.link')
      .data(links, (d:any) => {
        return d.id;
      });
    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .style("fill", "none")
      // .attr("marker-mid", "url(#arrow)")
      .attr('d', (d:any) => {
        var o = {
          x: source.x0,
          y: source.y0
        }
        return this.diagonal(o, o)
      });
    // UPDATE
    var linkUpdate = linkEnter.merge(link);
    // Transition back to the parent element position
    linkUpdate.transition()
      .duration(this.duration)
     .style("stroke", (d:any)=> (this.options.linkColor || "#4393c3"))
      .style("stroke-width", (d:any) => (this.options.linkWidth || "1px"))
      .style("stroke-dasharray", (d:any) => 
      d.data.linkProperties ? this.linkDasharray[d.data.linkProperties.strokeDasharray] : this.linkDasharray
      [this.options.linkDasharray || "none"])
      .attr('d', (d: any) => {
        return this.diagonal(d, d.parent)
      });
    // Remove any exiting links
    var linkExit = link.exit().transition()
      .duration(this.duration)
      .attr('d', (d: any) => {
        var o = {
          x: source.x,
          y: source.y
        }
        return this.diagonal(o, o)
      })
      .remove();

      let linkLabel = this.container.selectAll('.link-label')
      .data(links, (d:any) => {
        return d.id;
      });
    // Enter any new links at the parent's previous position.
    let linkLabelEnter = linkLabel.enter().insert('text', "g")  
      .attr('class', 'link-label')
      .style("text-anchor", "middle")
      .style("fill", this.options.linkTextColor || "#4393c3")
      .style("font-family", '"Helvetica Neue",Helvetica,Arial,sans-serif')
      .style("font-size", this.options.linkTextSize || "12px")
      .attr('x', (d:any) => {
        return (d.x+d.parent.x)/2 || 0;
      })
      .attr('y', (d:any) => {
        return (d.y+d.parent.y)/2 || 0;
      
      }); 
    // UPDATE
    var linkLabelUpdate = linkLabelEnter.merge(linkLabel);
    // Transition back to the parent element position
    linkLabelUpdate.transition()
      .duration(this.duration)
      .attr('x', (d:any) => {
        return (d.x+d.parent.x)/2 || 0;
      })
      .attr('y', (d:any) => {
        return (d.y+d.parent.y)/2 || 0;
      })
      .style("text-anchor", "middle")
      .style("fill", this.options.linkTextColor || "#4393c3")
      .style("font-family", '"Helvetica Neue",Helvetica,Arial,sans-serif')
      .style("font-size", this.options.linkTextSize || "12px")
      .text((d:any) => this.options.linkLabelField ? d.data.linkProperties ? d.data.linkProperties[this.options.linkLabelField] : "" : "")
    // Remove any exiting links
    var linkLabelExit = linkLabel.exit().transition()
      .duration(this.duration)
      .attr('x', (d:any) => {
        return (d.x+d.parent.x)/2 || 0;
      })
      .attr('y', (d:any) => {
        return (d.y+d.parent.y)/2 || 0;
      })
      .style('fill-opacity', 0)
      .remove();

    // Store the old positions for transition.
    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });

  } // update


}