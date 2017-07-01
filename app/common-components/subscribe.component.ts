import { Component, OnInit } from '@angular/core';
import { DatasetService } from '../services/dataset-service'
import * as d3 from 'd3';

@Component({
  moduleId: module.id,
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html'
  // providers: [DatasetService]
})
export class SubscribeComponent implements OnInit {
  private areachartDataset: Array<any>;
    
  public categorical: any = [//https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
    { "name" : "schemeAccent", "n": 8},
    { "name" : "schemeDark2", "n": 8},
    { "name" : "schemePastel2", "n": 8},
    { "name" : "schemeSet2", "n": 8},
    { "name" : "schemeSet1", "n": 9},
    { "name" : "schemePastel1", "n": 9},
    { "name" : "schemeCategory10", "n" : 10},
    { "name" : "schemeSet3", "n" : 12 },
    { "name" : "schemePaired", "n": 12},
    { "name" : "schemeCategory20", "n" : 20 },
    { "name" : "schemeCategory20b", "n" : 20},
    { "name" : "schemeCategory20c", "n" : 20 }
  ];

  public curveArray: any = [ // https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529
    {"d3Curve":d3.curveLinear,"curveTitle":"curveLinear"},
    {"d3Curve":d3.curveStep,"curveTitle":"curveStep"},
    {"d3Curve":d3.curveStepBefore,"curveTitle":"curveStepBefore"},
    {"d3Curve":d3.curveStepAfter,"curveTitle":"curveStepAfter"},
    {"d3Curve":d3.curveBasis,"curveTitle":"curveBasis"},
    {"d3Curve":d3.curveCardinal,"curveTitle":"curveCardinal"},
    {"d3Curve":d3.curveMonotoneX,"curveTitle":"curveMonotoneX"},
    {"d3Curve":d3.curveCatmullRom,"curveTitle":"curveCatmullRom"}
  ];
  // (second version)  
  // private scatterDataset: Array<any>;
  // private lineDataset: Array<any>;
  public lineOptions:any = { 
    'backgroundColor': '#000',//Text font inside the charts
    'textSize': "12px",
    'textColor':'#999',
    'isLegend': true,
    'legendPosition': 'left',//left | right 
    'isZoom': true,
    'xAxisLabel': 'Date',
    'yAxisLabel': 'Value',
    'dataColors': d3.scaleOrdinal(d3[this.categorical[9].name]),//example ["red", "#555"]
    'duration': 1000,
    'curve': this.curveArray[0].d3Curve
  };
  public lineOptions2:any = { 
    'backgroundColor': '#000',//Text font inside the charts
    'textSize': "12px",
    'textColor': '#999',
    'isLegend': true,
    'legendPosition': 'right',//left | right 
    'isZoom': true,
    'xAxisLabel': 'Date',
    'yAxisLabel': 'Value',
    'dataColors': d3.scaleOrdinal(d3[this.categorical[9].name]),//example ["red", "#555"]
    'duration': 1000,
    'curve': this.curveArray[0].d3Curve
  };
  public areaOptions:any = { 
    'backgroundColor': '#fff',
    'textSize': "12px",
    'textColor':'#000',
    'isLegend': true,
    'legendPosition': 'right',//left | right 
    'isZoom': true,
    'xAxisLabel': '',
    'yAxisLabel': '',
    'dataColors': d3.scaleOrdinal(d3[this.categorical[9].name]),
    'duration': 1000,
    'curve': this.curveArray[4].d3Curve
  };
  public barOptions:any = { 
    'backgroundColor': '#000',
    'textSize': "12px",
    'textColor':'#999',
    'isLegend': true,
    'legendPosition': 'left',//left | right 
    'isZoom': true,
    'xAxisLabel': 'Date',
    'yAxisLabel': 'Value',
    'dataColors': d3.scaleOrdinal(d3[this.categorical[9].name]),
    'duration': 1000
  };
  public pieOptions:any = { 
    'backgroundColor': '#000',
    'textSize': "14px",
    'textColor':'#999',
    "padAngle": 0,//small
    "cornerRadius": 0,
    'isLegend': true,
    'legendPosition': 'left',//left | right
    'dataColors': d3.scaleOrdinal(d3[this.categorical[9].name]),
    'duration': 1000,
    'innerRadiusDivider':5.0,
    'outerRadiusDivider':2.7,
    'labelRadiusDivider':2.2
  };
  public pieOptions2:any = { 
    'backgroundColor': '#000',
    'textSize': "14px",
    'textColor':'#999',
    "padAngle": 0.05,//small
    "cornerRadius": 10,
    'isLegend': false,
    'legendPosition': 'left',//left | right
    'dataColors': d3.scaleOrdinal(d3[this.categorical[9].name]),
    'duration': 1000,
    'innerRadiusDivider':5.0,
    'outerRadiusDivider':2.7,
    'labelRadiusDivider':2.2
  };
  public pieOptions3:any = { 
    'backgroundColor': '#fff',
    'textSize': "14px",
    'textColor':'#000',
    "padAngle": 0,//small
    "cornerRadius": 0,
    'isLegend': true,
    'legendPosition': 'right',//left | right
    'dataColors': d3.scaleOrdinal(d3["schemeCategory10"]),
    'duration': 1000,
    'innerRadiusDivider':5.0,
    'outerRadiusDivider':2.7,
    'labelRadiusDivider':2.2
  };

  public topologyOptions:any = { 
    'backgroundColor': '#fff',
    'nodeTextSize': "14px",
    'nodeTextColor':'#000',
    'linkTextSize': "14px",
    'linkTextColor':'#000',
    'duration': 1000,
    'strength': -5000,//less value => more distance between nodes, default -5000
    'linkColor': "#555",
    'arrowColor': "#555",
    'nodeLabelField': "ip_address", // from dataset-servise || topology.json  (in properties)
    'linkLabelField': "bitrate", // you can use null => without link label   (in properties)
    'linkTooltioLabelFields': ["status","nlq","latency","lq","admin_state_up","bitrate"],
    'nodeTooltipLabelFields': ["ip_address","mac_address", "alerts"]
  };
  
  constructor(private datasetService: DatasetService) { 
    this.generateAreachartDataset();
  }

  ngOnInit() {
    this.updateLine();
    this.updateBar();
    this.updateArea();
    this.updatePie();
    this.updateTopology();
  }

  updateLine() {
   // this.datasetService.updateLineDataset();
  }

  updateBar() {
    // this.datasetService.updateBarDataset();
  }

  updateArea() {
    // this.datasetService.updateAreaDataset();
  }
  
  updatePie() {
    // this.datasetService.updatePieDataset();
  }

  updateTopology() {
    // this.datasetService.updateTopologyDataset();
  }

  generateAreachartDataset() {
    this.areachartDataset = this.datasetService.getData().network;
  }
}
