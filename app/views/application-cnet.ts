import { Component, ChangeDetectorRef } from '@angular/core';
import { DatasetService } from '../services/dataset-service';
import { Router, NavigationEnd } from '@angular/router';
import { AlertSummary } from '../model/alertSummary-model';
import { AlertSummaryService } from '../services/alertSummary-service';
import {ApplicationfactsInfo} from '../model/applicationfactsInfo-model';
import {ApplicationfactsInfoService} from '../services/applicationfactsInfo-service';
import {ApplicationstatusInfo} from '../model/applicationstatusInfo-model';
import {ApplicationstatusInfoService} from '../services/applicationstatusInfo-service';
import {ApplicationsettingsInfo} from '../model/applicationsettingsInfo-model';
import {ApplicationsettingsInfoService} from '../services/applicationsettingsInfo-service';
import { EventSummary } from '../model/eventSummary-model';
import { EventSummaryService } from '../services/eventSummary-service';
import {ApplicationInfo} from '../model/applicationInfo-model';
import {ApplicationInfoService} from '../services/applicationInfo-service';
import {ContainerSummary} from '../model/containerSummary-model';
import {ContainerSummaryService} from '../services/containerSummary-service';
import {DiskutilitiesSummary} from '../model/diskutilitiesSummary-model';
import {DiskutilitiesSummaryService} from '../services/diskutilitiesSummary-service';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import * as _ from 'lodash';
import * as d3 from 'd3';
@Component({
    moduleId: module.id,
    templateUrl: 'application-cnet.html',
    providers: [DatasetService, DaterangepickerConfig, AlertSummaryService, EventSummaryService, 
    ApplicationInfoService,ApplicationfactsInfoService,  ApplicationstatusInfoService, 
    ApplicationsettingsInfoService, ContainerSummaryService, DiskutilitiesSummaryService]
})
export class ApplicationComponent {
     getareaChart: any;
    memoryLineChartData: any;
    isWidget: boolean;
    currentTab: string = 'dashboard';
    alertList: AlertSummary[];
     initialAlertList: AlertSummary[];
     alertIPs: string[];
     eventList: EventSummary[];
     initialEventList: EventSummary[];
     eventIPs : string[];
    applicationList : ApplicationInfo[];
    initialApplicationlist : ApplicationInfo[];
    applicationNAMEs: string[];
     applicationfactsList : ApplicationInfo[];
    initialApplicationfactslist : ApplicationfactsInfo[];
    applicationREPLICATIONCOUNTs: string[];
     applicationstatusList : ApplicationstatusInfo[];
    initialApplicationstatuslist : ApplicationstatusInfo[];
    applicationstatusUSERLISTs: string[];
    applicationsettingsList : ApplicationsettingsInfo[];
    initialApplicationsettingslist : ApplicationsettingsInfo[];
    applicationsettingsCPULOWTHRESHOLDs: string[];
    containerList : ContainerSummary[];
    initialContainerList : ContainerSummary[];
    containerAPPLICATIONs : string[];
    diskutilitiesList : DiskutilitiesSummary[];
    initialDiskutilitiesList : DiskutilitiesSummary[];
    diskutilitiesNAMEs : string[];
    pageIndex: number;
    totalPages: number;
    itemsPerPage: number;

    public categorical: any = [//https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
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
        'backgroundColor': '#fff',
        'textSize': "12px",
        'textColor': '#000',
        'isLegend': true,
        'legendPosition': 'right',
        'isZoom': true,
        'xAxisLabel': '',
        'yAxisLabel': '',
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)",
         "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ",
          "#b9783f ", "#b93e3d ", "#913167 "]),
        'duration': 1000,
        'curve': this.curveArray[4].d3Curve
    };

    public barOptions: any = {
        'backgroundColor': '#fff',
        'textSize': "12px",
        'textColor': '#000',
        'isLegend': true,
        'legendPosition': 'right',
        'isZoom': true,
        'xAxisLabel': '',
        'yAxisLabel': '',
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)",
         "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ",
          "#b9783f ", "#b93e3d ", "#913167 "]),
        'duration': 1000,
        'curve': this.curveArray[4].d3Curve
    };

    public lineOptions: any = {
        'backgroundColor': '#fff',//Text font inside the charts
        'textSize': "12px",
        'textColor': '#000',
        'isLegend': true,
        'legendPosition': 'right',
        'isZoom': true,
        'xAxisLabel': '',
        'yAxisLabel': '',
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)",
         "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", 
         "#b9783f ", "#b93e3d ", "#913167 "]),//example ["red", "#555"]
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
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", 
        "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", 
        "#b9783f ", "#b93e3d ", "#913167 "]),
        'duration': 1000
    };
    public pieOptions2: any = {
        'backgroundColor': '#fff',
        'textSize': "14px",
        'textColor': '#000',
        "padAngle": 0.05,//small
        "cornerRadius": 10,
        'isLegend': false,
        'legendPosition': 'right',//left | right
        'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)",
         "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", 
         "#b9783f ", "#b93e3d ", "#913167 "]),
        'duration': 1000
    };

    constructor(private router: Router, private alertSummaryService: AlertSummaryService, 
              private eventSummaryService :  EventSummaryService,
              private applicationInfoService: ApplicationInfoService,
              private applicationfactsInfoService: ApplicationfactsInfoService,
               private applicationstatusInfoService: ApplicationstatusInfoService,
                private applicationsettingsInfoService: ApplicationsettingsInfoService,
              private containerSummaryService: ContainerSummaryService,
              private diskutilitiesSummaryService: DiskutilitiesSummaryService,
              private ref: ChangeDetectorRef, private datasetService: DatasetService) {
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
    this.eventList = this.createPageChunk(this.initialEventList);
    this.applicationList = this.createPageChunk(this.initialApplicationlist);
     this.applicationfactsList = this.createPageChunk(this.initialApplicationfactslist);
    this.applicationstatusList = this.createPageChunk(this.initialApplicationstatuslist);
    this.applicationsettingsList = this.createPageChunk(this.initialApplicationsettingslist);
    this.containerList = this.createPageChunk(this.initialContainerList);
    this.diskutilitiesList = this.createPageChunk(this.initialDiskutilitiesList);
  }

  callAlerts() {
    this.alertSummaryService.getAlertSummary().subscribe(
      data => {
        this.pageIndex = 1;
        this.initialAlertList = data;
        this.alertList = this.createPageChunk(data);
      },
      () => console.log('Finished')
    );
  }
  
  callEvents(){
    this.eventSummaryService.getEventSummary().subscribe(
      data=>{
        this.pageIndex =1;
        this.initialEventList = data;
        this.eventList = this.createPageChunk(data);
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
  callApplicationfactss() {
    this.applicationfactsInfoService.getApplicationfactsInfo().subscribe(
      data => {
          this.pageIndex = 1;
          this.initialApplicationfactslist = data;
          this.applicationfactsList = this.createPageChunk(data);
      },
      () => console.log('Finished')
    );
  }
  callApplicationstatuss() {
    this.applicationstatusInfoService.getApplicationstatusInfo().subscribe(
      data => {
          this.pageIndex = 1;
          this.initialApplicationstatuslist = data;
          this.applicationstatusList = this.createPageChunk(data);
      },
      () => console.log('Finished')
    );
  }
   callApplicationsettingss() {
    this.applicationsettingsInfoService.getApplicationsettingsInfo().subscribe(
      data => {
          this.pageIndex = 1;
          this.initialApplicationsettingslist = data;
          this.applicationsettingsList = this.createPageChunk(data);
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
         this.callApplicationfactss();
        this.callApplicationstatuss();
        this.callApplicationsettingss();
        this.callContainers();
        this.callDiskutilitiess();
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