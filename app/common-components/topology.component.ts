import { Component, OnInit, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { DatasetService } from '../services/dataset-service';

@Component({
  moduleId: module.id,
  selector: 'topology-chart',
  templateUrl: 'topology.component.html',
  styleUrls: ['topology.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(window:resize)': 'onResize($event)'
  }
})

export class TopologyComponent implements OnInit {
  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() public options: any = {};
  private element: any;
  private isData: any = true;
  private initData: any;
  private data: any;
  private margin: any;
  private svg: any;
  private tooltip: any;
  private container: any;
  private width: number;
  private height: number;
  // private duration: number;
  private radius: number = 20;
  private range: number = 100;
  private saveTextWidth: number = 30;
  private simulation: any;
  private strokeDasharray:any = {};
  

  constructor(private datasetService: DatasetService, private elementRef: ElementRef) {
    let native = elementRef.nativeElement;
    let subscribe:any = native.getAttribute("data-subscribe");
    if (!subscribe) { 
      this.isData = false;
      return;
    }
    datasetService[subscribe].subscribe((initData:any) => {
      this.initData = initData;
      this.data = initData;
      this.element = this.chartContainer.nativeElement;
      this.run();
    });
    this.strokeDasharray.solid = "none";
    this.strokeDasharray.dotted = "2,3";
    this.strokeDasharray.dashed = "6,3";
  }

  public ngOnInit(){// we can use this.options
    this.element = this.chartContainer.nativeElement;
    if (!this.isData) {
      d3.select(this.element).append('p')
       .attr('class', 'message')
       .text('No data!');
    } else{
      d3.select(this.element).select('.message').remove();
    }
     if (!this.svg && this.data) { 
       this.create(); 
       this.update(); 
     }
     if (this.data) { this.update(); }
  }
  
  
  private run() {
    // console.log(this.data);
    if (this.svg && this.data) { this.update(); }
  }

  
  onResize(event:any) {
    if (this.container) {
      this.updateSize();
      this.update();
    }
  }


  private convertToCSV(objArray:string) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    array.map((object:any, i:number) => {
      if (i===0){
        let title = '';
        for (let index in object) {
          if (title != '') title += ','
          title += '"'+index+'"';
        }
      str += title + '\r\n';
      }
      
      let line = '';
      for (let index in object) {
        if (line != '') line += ','
        line += '"'+object[index]+'"';
      }
      str += line + '\r\n';
    });
    return str;
  }



  private create() {
    let that = this;
    this.margin = { top: 0, bottom: 0, left: 0, right: 0};
    this.width = (this.element.offsetWidth || 800) - this.margin.left - this.margin.right;
    this.height = (this.element.offsetHeight || 900) - this.margin.top - this.margin.bottom;
   
        
    this.svg = d3.select(this.element).append('svg')
      .attr('id', 'topology-svg')
      // .style('opacity', 0)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .call(d3.zoom()
        .scaleExtent([1 / 2, 5])
        .on("zoom", zoomed));
      
    
    this.svg.append("rect")
      .attr('class', 'background-topology-svg')
      .style('fill', 'transparent')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
    
    this.tooltip = d3.select(this.element).append('div').attr('class', 'd3-tooltip-wrapper d3-hidden');
    
    function zoomed() {
      that.container.attr("transform", d3.event.transform);
    }

    this.svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 9)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      // .style("markerUnits", "strokeWidth")//userSpaceOnUse
      // .style("stroke-width", "1px")
      .style("fill", this.options.arrowColor || "#4393c3")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");


    this.container = this.svg.append('g')
      .attr('class', 'container')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.container.append('g')
      .attr('class', 'nodes-circles');
    this.container.append('g')
      .attr('class', 'links');
    this.container.append('g')
      .attr('class', 'nodes');
    this.container.append('g')
      .attr('class', 'links-labels');  
    this.container.append('g')
      .attr('class', 'nodes-labels');

    let saveContainer = this.svg.append('g')
      .attr('class', 'save-container')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top/2 +10})`);
    
    let saveImage = (type:string) => {
      saveSvgAsPng(document.getElementById("topology-svg"), `topology_ + ${Date.now()}.${type}`, {scale: 10});
    }
    let saveJson = (type:string) => {
      let a = document.createElement('a');
        a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(JSON.stringify(this.initData)));
        a.setAttribute('download', `topology_ + ${Date.now()}.json`);
        a.click();
    }
    let saveCsv = (type:string) => {
      let a = document.createElement('a');
      a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(this.convertToCSV(this.initData)));
      a.setAttribute('download', `topology_ + ${Date.now()}.csv`);
      a.click();
    }

    let saveText = [
      {name: 'png', callback: saveImage}, 
      {name: 'jpeg', callback: saveImage},
      {name: 'json', callback: saveJson},
      {name: 'csv', callback: saveCsv}
    ];

    saveText.map((s:any, i:number)=>{
      saveContainer.append("text")
      .attr("class", "save-text")
      .style("font-size", this.options.textColor || "12px")
      .style("font-family", '"myverdana"')
      .style("text-anchor", "end")
      .style("fill", this.options.textColor || "#999")
      .style("cursor", "pointer")
      .attr("x", this.width - i * this.saveTextWidth)
      .attr("y", 4)
      .text(s.name)
      .on("click", () => {
        s.callback(s.name);
      });
    });
    
  } // create
  

  private updateSize(){
    this.width = (this.element.offsetWidth || 360) - this.margin.left - this.margin.right;
    this.height = (this.element.offsetHeight || 240) - this.margin.top - this.margin.bottom;
    this.svg
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.container
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.svg.select(".background-topology-svg")
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    this.svg.select('.save-container')
      .selectAll(".save-text")
      .attr("x", (d:any, i:number) => this.width - i * this.saveTextWidth);
  } // updateSize


  private update() {
    let that:this = this;
    let minSize = d3.min(this.data.nodes, (d:any) => (+d.properties.imageSize)); 
    this.simulation = d3.forceSimulation() // https://github.com/d3/d3-force
      // .velocityDecay(0.5)
      .force("link", d3.forceLink().id((d:any) => { return d.id; }))//.distance(minSize*5)
      // .force("collide",d3.forceCollide( (d:any) => { return (+d.properties.imageSize)}).iterations(20) )
      .force("collide", d3.forceCollide().strength(0.1).radius((d:any) => { return (+d.properties.imageSize); }).iterations(1))
      .force("charge", d3.forceManyBody())//.strength(-1000).distanceMin(minSize*1.5).distanceMax(minSize*5)
      // .strength(this.options.strength || -500)
      // .force("charge", d3.forceManyBody().distanceMin(minSize*4))//.distanceMax(500))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("y", d3.forceY().strength(0.002))
      .force("x", d3.forceX().strength(0.002));
      // .stop();
      // this.simulation.velocityDecay(0.1);
      // .force("vertical", d3.forceY().strength(0.018))
      // .force("horizontal", d3.forceX().strength(0.006));
      // this.simulation.alphaMin(1);//~0.0228 corresponds to 300 iterations.
      // setTimeout(()=> {
      //   this.simulation.stop();
      // }, this.options.duration || 1000)
      

    function dragstarted(d:any) {
      if (!d3.event.active) that.simulation.alphaTarget(0.01).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(d:any) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
      // that.simulation.stop();
    }
    
    function dragended(d:any) {
      if (!d3.event.active) that.simulation.alphaTarget(0);
      // Allows NODE FIXING
      d.fx = null;
      d.fy = null;
      // that.simulation.stop();
      // console.log(dragended);
    }

    if (!this.container){
      this.container = this.svg.select('conainer');
    }
    

    let link = this.container.select('.links').selectAll('.link')
      .data(this.data.links);
    link.exit().remove();
    this.container.selectAll('.link')
      .transition().duration(0)
      .attr('class', (d:any)=>'link' + ' link__source__' + (typeof d.source=== 'string' ? d.source : d.source.id) + ' link__target__'+(typeof d.target=== 'string' ? d.target : d.target.id))
      .attr("stroke", (d:any)=> (d.properties.linkColor || this.options.linkColor || "#4393c3"))
      .attr("stroke-width", (d:any) => d.properties.strokeWidth || "1px")
      .style("stroke-dasharray", (d:any) => this.strokeDasharray[d.properties.strokeDasharray || "none"]);
    link
      .enter()
      .append("path")//line
      .attr('class', (d:any)=>'link' + ' link__source__' + (typeof d.source=== 'string' ? d.source : d.source.id) + ' link__target__'+(typeof d.target=== 'string' ? d.target : d.target.id))
      .attr("stroke", (d:any)=> (d.properties.linkColor || this.options.linkColor || "#4393c3"))
      .attr("stroke-width", (d:any) => d.properties.strokeWidth || "1px")
      .style("stroke-dasharray", (d:any) => this.strokeDasharray[d.properties.strokeDasharray || "none"])
      .on("mousemove", (d:any) => {
        if (!this.options.linkTooltioLabelFields) { return; } 
        let text="";
        this.options.linkTooltioLabelFields.map((item:any)=>{
          text = text + `<tr><td class="bold">${item}:</td><td>${d.properties[item] || ""}</td></tr>`
        });
        this.tooltip.classed("d3-hidden", false)
        .html(`<div class="d3-tooltip-content"><table class="table table-striped">${text}</table></div>`);//<p class="d3-date">tooltip</p>
        this.tooltip
          .style("left", 0 + "px")
          .style("top", 0 + "px");
        })
      .on("mouseleave", () => {
        this.tooltip.classed("d3-hidden", true);
      }); 
      // .attr("stroke-width", function(d:any) { return Math.sqrt(d.value); });
    
    
    let linkInvisible = this.container.select('.links').selectAll('.link-invisible')
      .data(this.data.links);
    linkInvisible.exit().remove();
    this.container.selectAll('.link-invisible')
      .transition().duration(0)
      .attr('class', (d:any)=>'link-invisible' + ' link-invisible__source__' + (typeof d.source=== 'string' ? d.source : d.source.id) + ' link-invisible__target__'+(typeof d.target=== 'string' ? d.target : d.target.id));
    linkInvisible
      .enter()
      .append("path")//line
      .attr('class', (d:any)=>'link-invisible' + ' link-invisible__source__' + (typeof d.source=== 'string' ? d.source : d.source.id) + ' link-invisible__target__'+(typeof d.target=== 'string' ? d.target : d.target.id))
      .attr("stroke", "transparent")
      .attr("stroke-width", "1px")
      .attr("marker-end", "url(#arrow)");
    
    
    let nodeCircle = this.container.select('.nodes-circles').selectAll('.node-circle')
      .data(this.data.nodes);
    nodeCircle.exit().remove();
    this.container.selectAll('.node-circle')
      .transition().duration(0)
      .attr('class', (d:any)=>'node-circle' + ' node-circle__id__' + d.id)
      .attr("r", (d:any) => d.properties.imageSize/2 + this.options.circleStrokeWidth || 10)
      .attr("stroke", (d:any) => d.properties.circleColor || "#fff")
    nodeCircle
      .enter()
      .append("circle")
      .attr('class', (d:any)=>'node-circle' + ' node-circle__id__' + d.id)
      .attr("r", (d:any) => d.properties.imageSize/2 + this.options.circleStrokeWidth || 10)
      .attr("fill", "none")
      .attr("stroke", (d:any) => d.properties.circleColor || "#fff")
      .attr("stroke-width", this.options.circleStrokeWidth || 10);
      this.container.selectAll('.node').call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    let node = this.container.select('.nodes').selectAll('.node')
      .data(this.data.nodes);//.data(this.data.nodes).filter((d:any) => d.hide ? d.hide : true))
    node.exit().remove();
    this.container.selectAll('.node')
      .transition().duration(0)
      .attr('class', (d:any)=>'node' + ' node__id__' + d.id)
      .attr("height", (d:any) => d.properties.imageSize)
      .attr("width", (d:any) => d.properties.imageSize);
    node
      .enter()
      .append("image")
      .attr('class', (d:any)=>'node' + ' node__id__' + d.id)
      // .attr("r", that.radius)
      .attr("xlink:href", (d:any) => d.properties.imageSrc)
      .attr("height", (d:any) => d.properties.imageSize)
      .attr("width", (d:any) => d.properties.imageSize)
      // .attr("stroke", "#555")
      // .attr("stroke-width", "10px")
      // .attr("fill", "none")//"#333"function(d) { return this.color(d.group); })
      .on("click", (d:any) => {
        releasenode(d);
        this.simulation.stop();

        d.hide = d.hide ? !d.hide : true;
        var hide = d.hide;

        let recursive = (d:any,flag:boolean) => {
          this.data.links.map((c:any) => {
            // if (flag){
            //   console.log("id=",d.id, " source=",c.source.id);
            // }
            if (c.source.id === d.id){
              if (flag){
                d.hide = hide;
              }
              c.target.hide = hide;
              // console.log("==",d.id, c.target.id);
              d3.selectAll(".node__id__"+c.target.id).style("opacity", d.hide ? 0 : 1).style("display", d.hide ? "none" : null);
              d3.selectAll(".node-label__id__"+c.target.id).style("opacity", d.hide ? 0 : 1).style("display", d.hide ? "none" : null);
              d3.selectAll(".link__target__"+c.target.id).style("opacity", d.hide ? 0 : 1).style("display", d.hide ? "none" : null);
              d3.selectAll(".link-invisible__target__"+c.target.id).style("opacity", d.hide ? 0 : 1).style("display", d.hide ? "none" : null);
              d3.selectAll(".link-label__target__"+c.target.id).style("opacity", d.hide ? 0 : 1).style("display", d.hide ? "none" : null);
              recursive(c.target, true);
            }
          });
        }
        recursive(d,false);
        // console.log(this.data);
        // this.update();
        // this.simulation.restart();
      })
      .on("mousemove", (d:any) => {
        if (!this.options.nodeTooltipLabelFields) { return; } 
        let text="";
        this.options.nodeTooltipLabelFields.map((item:any)=>{
          text = text + `<tr><td class="bold">${item}:</td><td>${d.properties[item] || ""}</td></tr>`
        });
        this.tooltip.classed("d3-hidden", false)
        .html(`<div class="d3-tooltip-content"><table class="table table-striped">${text}</table></div>`);//<p class="d3-date">tooltip</p>
        // let coord:any = d3.mouse(this);
        this.tooltip
          .style("left", 0 + "px")
          .style("top", 0 + "px");
        })
      .on("mouseleave", () => {
        this.tooltip.classed("d3-hidden", true);
      });  
      this.container.selectAll('.node').call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));  

    let nodeLabel = this.container.select('.nodes-labels').selectAll('.node-label')
      .data(this.data.nodes);
    nodeLabel.exit().remove();
    this.container.selectAll('.node-label')
      .transition().duration(0)
      .text((d:any) => this.options.nodeLabelField ? d.properties[this.options.nodeLabelField] : "")
      .attr('class', (d:any)=>'node-label' + ' node-label__id__' + d.id);
    nodeLabel
      .enter()
      .append("text")
      .attr('class', (d:any)=>'node-label' + ' node-label__id__' + d.id)
      .style("text-anchor", "middle")
      .style("fill", this.options.nodeTextColor || "#4393c3")
      .style("font-family", '"myverdana"')
      .style("font-size", this.options.nodeTextSize || "12px")    
      .text((d:any) => this.options.nodeLabelField ? d.properties[this.options.nodeLabelField] : "")
    
    let linkLabel = this.container.select('.links-labels').selectAll('.link-label')
      .data(this.data.links);
    linkLabel.exit().remove();
    this.container.selectAll('.link-label')
      .transition().duration(0)
      .text((d:any) => this.options.linkLabelField ? d.properties[this.options.linkLabelField] : "")
      .attr('class', (d:any)=>'link-label' + ' link-label__source__' + (typeof d.source=== 'string' ? d.source : d.source.id) + ' link-label__target__'+(typeof d.target=== 'string' ? d.target : d.target.id));
    linkLabel
      .enter()
      .append("text")
      .attr('class', (d:any)=>'link-label' + ' link-label__source__' + (typeof d.source=== 'string' ? d.source : d.source.id) + ' link-label__target__'+(typeof d.target=== 'string' ? d.target : d.target.id))
      .style("text-anchor", "middle")
      .style("fill", this.options.linkTextColor || "#4393c3")
      .style("font-family", '"myverdana"')
      .style("font-size", this.options.linkTextSize || "12px")
      // .style("pointer-events", "none") 
      .text((d:any) => this.options.linkLabelField ? d.properties[this.options.linkLabelField] : "")
      .on("mousemove", (d:any) => {
        if (!this.options.linkTooltioLabelFields) { return; } 
        let text="";
        this.options.linkTooltioLabelFields.map((item:any)=>{
          text = text + `<tr><td class="bold">${item}:</td><td>${d.properties[item] || ""}</td></tr>`
        });
        this.tooltip.classed("d3-hidden", false)
        .html(`<div class="d3-tooltip-content"><table class="table table-striped">${text}</table></div>`);//<p class="d3-date">tooltip</p>
        that.tooltip
          .style("left", 0 + "px")
          .style("top", 0 + "px");
        })
      .on("mouseleave", () => {
        this.tooltip.classed("d3-hidden", true);
      }); 


    this.simulation
      .nodes(this.data.nodes)
      .on("tick", ticked);
      // .on("end", () => {
      //   d3.select('#topology-svg').style('opacity', 1);
      // });

    // d3.range(200).forEach(this.simulation.tick);
    // this.simulation.on("tick", ticked);

    this.simulation.force("link")
      .links(this.data.links);
  
    function releasenode(d:any) {
      d.fx = null;
      d.fy = null;
    }

    function ticked() {
      nodeCircle
        .attr("cx", (d:any) => (d.x) || 0)
        .attr("cy", (d:any) => (d.y) || 0)//+(that.options.circleStrokeWidth || 10)/2
      node
        // .each((d:any) => {
        //   // d.x = Math.max(that.radius, Math.min(that.width - that.radius, d.x));
        //   // d.y = Math.max(that.radius, Math.min(that.height - that.radius, d.y));
        //   d.x = Math.max(d.properties.imageSize, Math.min(that.width - d.properties.imageSize, d.x));
        //   d.y = Math.max(d.properties.imageSize, Math.min(that.height - d.properties.imageSize, d.y));
        // })
        .attr("x", (d:any) => (d.x-d.properties.imageSize/2) || 0)
        .attr("y", (d:any) => (d.y-d.properties.imageSize/2) || 0)
        // .attr("cx", function(d:any) { return d.x; })
        // .attr("cy", function(d:any) { return d.y; });
      // link
      //   .attr("x1", function(d:any) { return d.source.x; })
      //   .attr("y1", function(d:any) { return d.source.y; })
      //   .attr("x2", function(d:any) { return d.target.x; })
      //   .attr("y2", function(d:any) { return d.target.y; });
      linkInvisible.attr('d', (d:any) => {
        let deltaX = d.target.x - d.source.x,
            deltaY = d.target.y - d.source.y,
            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
            normX = deltaX / dist,
            normY = deltaY / dist,
            padding = that.radius;
            d.sourceX = d.source.x + (padding * normX),
            d.sourceY = d.source.y + (padding * normY),
            d.targetX = d.target.x - (padding * normX),
            d.targetY = d.target.y - (padding * normY);
            //dr = Math.sqrt(dx * dx + dy * dy);
            //return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        return 'M' + (d.sourceX || 0) + ',' + (d.sourceY || 0) + 'L' + (d.targetX || 0) + ',' + (d.targetY || 0);
      });
      link.attr('d', (d:any) => {
        let deltaX = d.target.x - d.source.x,
            deltaY = d.target.y - d.source.y,
            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
            normX = deltaX / dist,
            normY = deltaY / dist,
            padding = that.radius;
            d.sourceX = d.source.x + (padding * normX),
            d.sourceY = d.source.y + (padding * normY),
            d.targetX = d.target.x - (padding * normX),
            d.targetY = d.target.y - (padding * normY);
            //dr = Math.sqrt(dx * dx + dy * dy);
            //return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        return 'M' + (d.sourceX || 0) + ',' + (d.sourceY || 0) + 'L' + (d.targetX || 0) + ',' + (d.targetY || 0);
      });
      nodeLabel
    		.attr("x", (d:any) => (d.x) || 0)
        .attr("y",  (d:any) => (d.y + 4) || 0);

      linkLabel
    		.attr("x", (d:any) => (d.sourceX + d.targetX)/2 || 0)
        .attr("y",  (d:any) => (d.sourceY + d.targetY)/2 || 0);
    }



  } // update
  

}