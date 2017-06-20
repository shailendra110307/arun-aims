import { Component, ChangeDetectorRef } from '@angular/core';
import { DatasetService } from '../services/dataset-service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AlertSummary } from '../model/alertSummary-model';
import { AlertSummaryService } from '../services/alertSummary-service';
import { EventSummary } from '../model/eventSummary-model';
import { EventSummaryService } from '../services/eventSummary-service';
import { ApplicationInfo } from '../model/applicationInfo-model';
import { ApplicationInfoService } from '../services/applicationInfo-service';
import { ContainerSummary } from '../model/containerSummary-model';
import { ContainerSummaryService } from '../services/containerSummary-service';
import { DiskutilitiesSummary } from '../model/diskutilitiesSummary-model';
import { DiskutilitiesSummaryService } from '../services/diskutilitiesSummary-service';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import {ServerinfoSummary} from '../model/serverinfoSummary-model';
import {ServerinfoSummaryService} from '../services/serverinfoSummary-service';
import {ServerfactsInfo} from '../model/serverfactsInfo-model';
import {ServerfactsInfoService} from '../services/serverfactsInfo-service';
import {ProcessdetailsInfo} from '../model/processdetailsInfo-model';
import {ProcessdetailsInfoService} from '../services/processdetailsInfo-service';
import * as _ from 'lodash';
import * as d3 from 'd3';
@Component({
    moduleId: module.id,
    templateUrl: 'server-cnet.html',
    styleUrls: ['monitoring-cnet.css'],
    providers: [DatasetService,ServerinfoSummary,ServerinfoSummaryService,ProcessdetailsInfo,ProcessdetailsInfoService,ServerfactsInfo,ServerfactsInfoService, DaterangepickerConfig, AlertSummaryService, EventSummaryService, ApplicationInfoService, ContainerSummaryService, DiskutilitiesSummaryService]
})
export class ServerComponent {
    getareaChart: any;
    memoryLineChartData: any;
    isWidget: boolean;
    currentTab: string = 'dashboard';
    initialAlertList: AlertSummary[];
    alertIPs: string[];
    eventList: EventSummary[];
    filterEventDash: EventSummary = new EventSummary();
    totalEvents: number;
    eventIPs : string[];
    applicationList : ApplicationInfo[];
    initialApplicationlist : ApplicationInfo[];
    applicationNAMEs: string[];
    containerList : ContainerSummary[];
    initialContainerList : ContainerSummary[];
    containerAPPLICATIONs : string[];
    diskutilitiesList : DiskutilitiesSummary[];
    initialDiskutilitiesList : DiskutilitiesSummary[];
    diskutilitiesNAMEs : string[];
    serverinfoList : ServerinfoSummary[];
    initialServerinfoList : ServerinfoSummary[];
    ServerinfoNODEs : string[];
     serverfactsList : ServerfactsInfo[];
    initialServerfactsList : ServerfactsInfo[];
    ServerfactsACTIVEUSERSs : string[];
    processdetailsList : ProcessdetailsInfo[];
    initialProcessdetailsList : ProcessdetailsInfo[];
    ProcessdetailsTOTALs : string[];

    alertId: string;

    alertList: AlertSummary[];
    filter: AlertSummary = new AlertSummary();    
    alertsServer: AlertSummary[];
    alertsApplication: AlertSummary[];
    alertsStatus: string;
    totalAlerts: number;
    totalWarning: number = 0;
    totalHigh: number = 0;
    totalCritical: number = 0;

    id: number;
    
  pageIndex: number;
  totalPages: number;
  itemsPerPage: number;

    public categorical: any = [ // https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
        { "name": "schemeAccent", "n": 8 },
        { "name": "schemeDark2", "n": 8 },
        { "name": "schemePastel2", "n": 8 },
        { "name": "schemeSet2", "n": 8 },
        { "name": "schemeSet1", "n": 9 },
        { "name": "schemePastel1", "n": 9 },
        { "name": "schemeCategory10", "n": 10 },
        { "name": "schemeSet3", "n": 12 },
        { "name": "schemePaired", "n": 12 },
        { "name": "schemeCategory20", "n": 20 },
        { "name": "schemeCategory20b", "n": 20 },
        { "name": "schemeCategory20c", "n": 20 }
    ];

    public curveArray: any = [ // https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529
        { "d3Curve": d3.curveLinear, "curveTitle": "curveLinear" },
        { "d3Curve": d3.curveStep, "curveTitle": "curveStep" },
        { "d3Curve": d3.curveStepBefore, "curveTitle": "curveStepBefore" },
        { "d3Curve": d3.curveStepAfter, "curveTitle": "curveStepAfter" },
        { "d3Curve": d3.curveBasis, "curveTitle": "curveBasis" },
        { "d3Curve": d3.curveCardinal, "curveTitle": "curveCardinal" },
        { "d3Curve": d3.curveMonotoneX, "curveTitle": "curveMonotoneX" },
        { "d3Curve": d3.curveCatmullRom, "curveTitle": "curveCatmullRom" }
    ];
    public areaOptions: any = {
        'backgroundColor': '#ffffff',
        'textSize': "12px",
        'textColor': '#000',
        'isLegend': true,
        'legendPosition': 'right',
        'isZoom': true,
        'xAxisLabel': 'value',
        'yAxisLabel': '',
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
        'duration': 1000,
        'curve': this.curveArray[4].d3Curve
    };

    public barOptions: any = {
        'backgroundColor': '#ffffff',
        'textSize': "12px",
        'textColor': '#000',
        'isLegend': true,
        'legendPosition': 'right',
        'isZoom': true,
        'xAxisLabel': '',
        'yAxisLabel': '',
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
        'duration': 1000,
        'curve': this.curveArray[4].d3Curve
    };

    public lineOptions: any = {
        'backgroundColor': '#ffffff',//Text font inside the charts
        'textSize': "12px",
        'textColor': '#000',
        'isLegend': false,
        'legendPosition': 'right',
        'isZoom': true,
        'xAxisLabel': '',
        'yAxisLabel': '',
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),//example ["red", "#555"]
        'duration': 1000,
        'curve': this.curveArray[0].d3Curve
    };

    public lineOptions2: any = {
        'backgroundColor': '#ffffff',//Text font inside the charts
        'textSize': "12px",
        'textColor': '#000',
        'isLegend': true,
        'legendPosition': 'right',//left | right 
        'isZoom': true,
        'xAxisLabel': 'Date',
        'yAxisLabel': 'Value',
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),//example ["red", "#555"]
        'duration': 1000,
        'curve': this.curveArray[0].d3Curve
    };
    public pieOptions: any = {
        'backgroundColor': '#fff',
        'textSize': "14px",
        'textColor': '#000',
        "padAngle": 0,//small
        "cornerRadius": 0,
        'isLegend': true,
        'legendPosition': 'right',//left | right
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
        'duration': 1000,
        'innerRadiusDivider': 5.0,
        'outerRadiusDivider': 2.7,
        'labelRadiusDivider': 2.2
    };
    public pieOptions2: any = {
        'backgroundColor': '#fff',
        'textSize': "14px",
        'textColor': '#000',
        "padAngle": 0.05,//small
        "cornerRadius": 10,
        'isLegend': false,
        'legendPosition': 'right',//left | right
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
        'duration': 1000,
        'innerRadiusDivider': 5.0,
        'outerRadiusDivider': 2.7,
        'labelRadiusDivider': 2.2
    };
    public pieOptions3: any = {
        'backgroundColor': '#ffffff',
        'textSize': "14px",
        'textColor': '#000',
        "padAngle": 0,//small
        "cornerRadius": 0,
        'isLegend': true,
        'legendPosition': 'right',//left | right
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
        'duration': 1000,
        'innerRadiusDivider': 5.0,
        'outerRadiusDivider': 2.7,
        'labelRadiusDivider': 2.2
    };
    public topologyOptions:any = {
    'backgroundColor': '#fff',
    'nodeTextSize': "14px",
    'nodeTextColor':'#000',
    'linkTextSize': "14px",
    'linkTextColor':'#000',
    // 'duration':1000,
    // 'strength': -500,//deprecated, less value => more distance between nodes, default -500
    'linkColor': "#555",
    'arrowColor': "#555",
    'nodeLabelField': "ip_address", // from dataset-servise || topology.json  (in properties)
    'linkLabelField': null,//"bitrate", // you can use null => without link label   (in properties)
    'linkTooltioLabelFields': ["status","nlq","latency","lq","admin_state_up","bitrate"],
    'nodeTooltipLabelFields': ["ip_address","mac_address", "alerts"],
    //'circleStrokeWidth': 4
  };

    constructor(private router: Router, private alertSummaryService: AlertSummaryService, 
              private eventSummaryService :  EventSummaryService,
              private applicationInfoService: ApplicationInfoService,
              private containerSummaryService: ContainerSummaryService,
              private diskutilitiesSummaryService: DiskutilitiesSummaryService,
              private serverinfoSummaryService: ServerinfoSummaryService,
              private serverfactsInfoService: ServerfactsInfoService,
              private ProcessdetailsInfoService: ProcessdetailsInfoService,
              private ref: ChangeDetectorRef, private datasetService: DatasetService,
              private route: ActivatedRoute ) {
    this.isWidget = false;
    this.pageIndex = 1;
    this.itemsPerPage = 5;
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (_.startsWith(val.url, '/widget')) {
          this.isWidget = true;
        } else {
          this.isWidget = false;
        }
      }
    });
  }

  onPageChange(newIndex: number) {
    this.pageIndex = newIndex;
    this.alertList = this.createPageChunk(this.initialAlertList);
    this.applicationList = this.createPageChunk(this.initialApplicationlist);
    this.containerList = this.createPageChunk(this.initialContainerList);
    this.diskutilitiesList = this.createPageChunk(this.initialDiskutilitiesList);
    this.serverinfoList = this.createPageChunk(this.initialServerinfoList);
    this.serverfactsList = this.createPageChunk(this.initialServerfactsList);
    this.processdetailsList = this.createPageChunk(this.initialProcessdetailsList);
  }

  callAlerts() {
        this.alertSummaryService.getAlertSummary().subscribe(
            data => {
                this.alertList = this.getAlertList(data["alerts"][0]);
            },
            () => console.log('Finished')
        );
    }

  getAlertList(data: any[]): any[] {
        let alerts:any[] = [];
        let alertsServer:any[] = [];
        let alertsApplication:any[] = [];
        let alertsFiltered:any[] = [];
        
        for(let i=0; i < data["server"].length; i++){
            alerts.push(data["server"][i]);
            alertsServer.push(data["server"][i]);
        }
        for(let j=0; j < data["application"].length; j++){
            alerts.push(data["application"][j]);
            alertsApplication.push(data["application"][j]);
        }
        
        let length:number = alerts.length;
        
        for(let i=0; i<length; i++){
            if(alerts[i].severity === "Warning"){
                this.totalWarning++;
            }
            if(alerts[i].severity === "High"){
                this.totalHigh++;
            }
            if(alerts[i].severity === "Critical"){
                this.totalCritical++;
            }
        }
        this.totalAlerts = alerts.length;
        this.alertsServer = alertsServer;
        this.alertsApplication = alertsApplication;
        
        for(let i=0; i<length; i++){
            if(alerts[i].ip_address == this.id){
                alertsFiltered.push(alerts[i]);
            }
        }

        return alertsFiltered;
    }
  
  callEvents(){
    this.eventSummaryService.getEventSummary().subscribe(
      data=>{
        this.pageIndex =1;
        this.eventList = data;
        this.totalEvents = data.length;
      },
      ()=> console.log('Finished')
    );
  }
  callApplications() {
    this.applicationInfoService.getApplicationInfo().subscribe(
      data => {
          this.pageIndex = 1;
          this.initialApplicationlist = data;
          this.applicationList = this.createPageChunk(data);
      },
      () => console.log('Finished')
    );
  }
callContainers() {
this.containerSummaryService.getContainerSummary().subscribe(
      data => {
          this.pageIndex = 1;
          this.initialContainerList = data;
          this.containerList = this.createPageChunk(data);
      },
      () => console.log('Finished')
    );
  }

callDiskutilitiess() {
  this.diskutilitiesSummaryService.getDiskutilitiesSummary().subscribe(
    data =>{
      this.pageIndex=1;
      this.initialDiskutilitiesList = data;
      this.diskutilitiesList = this.createPageChunk(data);
    },
    () => console.log('Finished')
  );
}
callServerinfos() {
  this.serverinfoSummaryService.getServerinfoSummary().subscribe(
    data =>{
      this.pageIndex=1;
      this.initialServerinfoList = data;
      this.serverinfoList = this.createPageChunk(data);
    },
    () => console.log('Finished')
  );
}
callServerfactss() {
  this.serverfactsInfoService.getServerfactsInfo().subscribe(
    data =>{
      this.pageIndex=1;
      this.initialServerfactsList = data;
      this.serverfactsList = this.createPageChunk(data);
    },
    () => console.log('Finished')
  );
}
callProcessdetailss() {
  this.ProcessdetailsInfoService.getProcessdetailsInfo().subscribe(
    data =>{
      this.pageIndex=1;
      this.initialProcessdetailsList = data;
      this.processdetailsList = this.createPageChunk(data);
    },
    () => console.log('Finished')
  );
}
  createPageChunk(data: any[]): any[] {
    this.totalPages = _.ceil(data.length / this.itemsPerPage);
    return _.chunk(data || [], this.itemsPerPage)[this.pageIndex - 1];
  }

  onIPChange(filteredIPs: any[]) {
    this.pageIndex = 1;
    if (filteredIPs === undefined) {
      this.alertList = this.createPageChunk(this.initialAlertList);
    } else {
      this.alertList = this.createPageChunk(_.filter(this.initialAlertList || [], function (alert) {
        return _.includes(filteredIPs, alert.ip_address);
      }));
    }
  }

    ngOnInit() {
        this.getAllData();
         this.callAlerts();
        this.callEvents();
        this.callApplications();
        this.callContainers();
        this.callDiskutilitiess();
        this.callServerinfos();
        this.callServerfactss();
        this.callProcessdetailss();
        this.id = this.route.snapshot.params['id'];
    }
    changeTab(selectedTab) {
        if (this.currentTab !== selectedTab) {
            this.currentTab = selectedTab;
            this.getAllData();
        }
    }
    getAllData() {
        this.datasetService.getServiceData();
        // this.datasetService.updatePieDataset();
        // this.datasetService.updateTopologyDataset();
       
    }


}
