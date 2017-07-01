import { Component, ChangeDetectorRef } from '@angular/core';
import { DatasetService } from '../services/dataset-service';
import { Router, NavigationEnd } from '@angular/router';
import { EventSummary } from '../model/eventSummary-model';
import { EventSummaryService } from '../services/eventSummary-service';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { AlertSummary } from '../model/alertSummary-model';
import { AlertSummaryService } from '../services/alertSummary-service';
import {AppSettings} from '../settings';
import { LocalStorageService } from 'angular-2-local-storage';
import * as _ from 'lodash';
import * as d3 from 'd3';

@Component({
    moduleId: module.id,
    templateUrl: 'monitoring-cnet.html',
    styleUrls: ['monitoring-cnet.css'],
    providers: [DatasetService, DaterangepickerConfig, AlertSummaryService,EventSummaryService]
})
export class CnetMonitoringView {
    getareaChart: any;
    memoryLineChartData: any;
    isWidget: boolean;
    currentTab: string = 'overall';
    
    eventList: EventSummary[];
    eventsServer: EventSummary[];
    eventsApplication: EventSummary[];
    filterEvent: EventSummary = new EventSummary();
    filterEventSer: EventSummary = new EventSummary();    
    filterEventApp: EventSummary = new EventSummary();
    totalEvents: number;    
    totalEventsSer: number;
    totalEventsApp: number;
    
    alertList: AlertSummary[];
    alertsServer: AlertSummary[];
    alertsApplication: AlertSummary[];
    filterAlert: AlertSummary = new AlertSummary();
    filterAlertSer: AlertSummary = new AlertSummary();
    filterAlertApp: AlertSummary = new AlertSummary();
    alertsStatus: string;
    totalAlerts: number;
    totalAlertsSer: number;
    totalAlertsApp: number;
    totalWarning: number = 0;
    totalHigh: number = 0;
    totalCritical: number = 0;
    totalWarningSer: number = 0;
    totalHighSer: number = 0;
    totalCriticalSer: number = 0;
    totalWarningApp: number = 0;
    totalHighApp: number = 0;
    totalCriticalApp: number = 0;

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
        'backgroundColor': '#fff',
        'textSize': '12px',
        'textColor': '#000',
        'isLegend': true,
        'isZoom': false,
        'xAxisLabel': 'xAxisLabel',
        'yAxisLabel': 'yAxisLabel',
        'dataColors': d3.scaleOrdinal().range([
            'rgba(0,136,191,0.8)',
            'rgba(152, 179, 74,0.8)',
            'rgba(246, 187, 66,0.8)',
            '#cc4748 ',
            '#cd82ad ',
            '#2f4074 ',
            '#448e4d ',
            '#b7b83f ',
            '#b9783f ',
            '#b93e3d ',
            '#913167 '
        ]),
        'duration': 1000,
        'curve': this.curveArray[4].d3Curve,
        'isDropdown': false
        // 'axisMarginForNumbers':50
    };

    public barOptions: any = {
        'backgroundColor': '#fff',
    'textSize': "12px",
    'textColor':'#000',
    'isLegend': true,
    // 'legendPosition': 'left',//left | right 
    'isZoom': true,
    'xAxisLabel': 'Date',
    'yAxisLabel': 'Value',
    'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
    'duration': 1000,
    'isDropdown': true
    // 'axisMarginForNumbers':50
    };

    public lineOptions: any = {
        'backgroundColor': '#fff',//Text font inside the charts
    'textSize': "12px",
    'textColor':'#000',
    'isLegend': true,
    // 'legendPosition': 'left',//left | right 
    'isZoom': false,
    'xAxisLabel': 'Date',
    'yAxisLabel': 'Value',
    'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
    'duration': 1000,
    'curve': this.curveArray[0].d3Curve,
    'isDropdown': false
    // 'axisMarginForNumbers':50
    };

    public lineOptions2: any = {
         'backgroundColor': '#fff',//Text font inside the charts
    'textSize': "12px",
    'textColor':'#000',
    'isLegend': true,
    // 'legendPosition': 'right',//left | right 
    'isZoom': false,
    'xAxisLabel': 'Date',
    'yAxisLabel': 'Value',
    'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
    'duration': 1000,
    'curve': this.curveArray[0].d3Curve,
    // 'axisMarginForNumbers':50
    };
    public pieOptions: any = {
        'backgroundColor': '#fff',
    'textSize': "12px",
    'textColor':'#000',
    "padAngle": 0,//small
    "cornerRadius": 0,
    'isLegend': true,
    // 'legendPosition': 'left',//left | right
    'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
    'duration': 0,
    'innerRadiusDivider':5.0,
    'outerRadiusDivider':2.7,
    'labelRadiusDivider':2.2
    };
    public pieOptions2: any = {
        'backgroundColor': '#fff',
    'textSize': "12px",
    'textColor':'#000',
    "padAngle": 0.05,//small
    "cornerRadius": 10,
    'isLegend': false,
    // 'legendPosition': 'left',//left | right
    'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
    'duration': 1000,
    'innerRadiusDivider':5.0,
    'outerRadiusDivider':2.7,
    'labelRadiusDivider':2.2
    };
    public pieOptions3: any = {
        'backgroundColor': '#fff',
    'textSize': "12px",
    'textColor':'#000',
    "padAngle": 0,//small
    "cornerRadius": 0,
    'isLegend': true,
    // 'legendPosition': 'right',//left | right
    'dataColors': d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
    'duration': 1000,
    'innerRadiusDivider':5.0,
    'outerRadiusDivider':2.7,
    'labelRadiusDivider':2.2
    };
    public topologyOptions: any = {
        'backgroundColor': '#fff',
        'nodeTextSize': "14px",
        'nodeTextColor': '#000',
        'linkTextSize': "14px",
        'linkTextColor': '#000',
        // 'duration': 1000,
        // 'strength': -5000,//less value => more distance between nodes, default -5000
        'linkColor': "#555",
        'arrowColor': "#555",
        'nodeLabelField': "ip_address", // from dataset-servise || topology.json  (in properties)
        'linkLabelField': "bitrate", // you can use null => without link label   (in properties)
        'linkTooltioLabelFields': ["status", "nlq", "latency", "lq", "admin_state_up", "bitrate"],
        'nodeTooltipLabelFields': ["ip_address", "mac_address", "alerts"],
        'circleStrokeWidth': 4
    };

     public topologytreeOptions:any = { 
    'backgroundColor': '#fff',
    'nodeTextSize': "14px",
    'nodeTextColor':'#000',
    'linkTextSize': "14px",
    'linkTextColor':'#000',
    'depth': false, // false or number>0.  Last wisible child-level (row). Start from 0 (main parent).
    'duration': 0, // 1000 === 1second. Without animation => 0
    'linkColor': "#555",
    'linkType': "straight",//straight, curved
    'linkWidth': "1px",
    'linkDasharray': 'solid',//solid, dotted, dashed
    // 'arrowColor': "#555",
    'nodeLabelField': "ip_address", // from dataset-servise || topology.json(in properties)
    'linkLabelField': null, // you can use null => without link label (in properties)
    'linkTooltioLabelFields': ["status","nlq","latency","lq","admin_state_up","bitrate"],
    'nodeTooltipLabelFields': ["ip_address","mac_address", "alerts"],
    'circleStrokeWidth': 4,
    'isChildren': 'lightsteelblue',
  };

    constructor(private router: Router, private alertSummaryService: AlertSummaryService,
        private ref: ChangeDetectorRef, private datasetService: DatasetService,private eventSummaryService: EventSummaryService,
        private localStorageService: LocalStorageService) {
        this.isWidget = false;
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

    ngOnInit() {
        this.getAllData();
        this.callAlerts();
        this.callEvents();
    }

    callAlerts() {
        this.alertSummaryService.getOverallAlertSummary().subscribe(
            data => {
                this.alertList = this.getAlertList(data["alerts"]);
            },
            () => console.log('Finished')
        );
    }   

    getAlertList(data: any[]): any[] {
        let alertsServer:any[] = [];
        let alertsApplication:any[] = [];
        
        for(let i=0; i < data.length; i++){
            if(data[i].type == "server"){
                alertsServer.push(data[i]);
            } else {
                alertsApplication.push(data[i]);
            }

            if(data[i].severity === "Warning"){
                this.totalWarning++;
            }
            if(data[i].severity === "High"){
                this.totalHigh++;
            }
            if(data[i].severity === "Critical"){
                this.totalCritical++;
            }
        }
        this.alertsServer = alertsServer;
        this.alertsApplication = alertsApplication;
        this.totalAlerts = data.length;

        for(let i=0; i<alertsServer.length; i++){
            if(alertsServer[i].severity === "Warning"){
                this.totalWarningSer++;
            }
            if(alertsServer[i].severity === "High"){
                this.totalHighSer++;
            }
            if(alertsServer[i].severity === "Critical"){
                this.totalCriticalSer++;
            }
        }
        this.totalAlertsSer = alertsServer.length;

        for(let i=0; i<alertsApplication.length; i++){
            if(alertsApplication[i].severity === "Warning"){
                this.totalWarningApp++;
            }
            if(alertsApplication[i].severity === "High"){
                this.totalHighApp++;
            }
            if(alertsApplication[i].severity === "Critical"){
                this.totalCriticalApp++;
            }
        }
        this.totalAlertsApp = alertsApplication.length;       
        
        return data;
    }

    callEvents() {
        this.eventSummaryService.getOverallEventSummary().subscribe(
            data => {
                this.eventList = this.getEventList(data["events"]);
            },
            () => console.log('Finished')
        );
    }

    getEventList(data: any[]): any[] {
        let eventsServer:any[] = [];
        let eventsApplication:any[] = [];
        
        for(let i=0; i < data.length; i++){
            if(data[i].type == "server"){
                eventsServer.push(data[i]);
            } else {
                eventsApplication.push(data[i]);
            }
        }
        this.eventsServer = eventsServer;
        this.eventsApplication = eventsApplication;
        this.totalEvents = data.length;
        this.totalEventsSer = eventsServer.length;
        this.totalEventsApp = eventsApplication.length;       
        
        return data;
    }

    changeTab(selectedTab) {
        if (this.currentTab !== selectedTab) {
            this.currentTab = selectedTab;
            //this.getAllData();
        }
    }

    getPage(ip, type) {
        localStorage.setItem('ip', ip);
        if(type === "server"){
            this.router.navigate(['server-cnet']);
        } else {
            this.router.navigate(['application-cnet']);
        }      
    }

    getAllData() {
        this.datasetService.getServiceData();
    }    
}
