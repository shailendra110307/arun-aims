import { Component, ChangeDetectorRef } from '@angular/core';
import { DatasetService } from '../services/dataset-service';
import { Router, NavigationEnd } from '@angular/router';
import { EventSummary } from '../model/eventSummary-model';
import { EventSummaryService } from '../services/eventSummary-service';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { AlertSummary } from '../model/alertSummary-model';
import { AlertSummaryService } from '../services/alertSummary-service';
import {AppSettings} from '../settings';
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
    eventList: EventSummary[];
    initialEventList: EventSummary[];
    currentTab: string = 'overall';    
    alertIPs: string[];
    pageIndex: number;
    totalPages: number;
    itemsPerPage: number;

    alertList: AlertSummary[];
    filter: AlertSummary = new AlertSummary();    
    alertsServer: AlertSummary[];
    alertsApplication: AlertSummary[];
    alertsStatus: string;
    totalAlerts: number;
    totalWarning: number = 0;
    totalHigh: number = 0;
    totalCritical: number = 0;

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
        'isLegend': false,
        'legendPosition': 'right',
        'isZoom': true,
        'xAxisLabel': '',
        'yAxisLabel': '',
        'dataColors':d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
        'duration': 1000,
        'curve': this.curveArray[4].d3Curve
    };

    public barOptions: any = {
        'backgroundColor': '#ffffff',
        'textSize': "12px",
        'textColor': '#000',
        'isLegend': false,
        'legendPosition': 'right',
        'isZoom': true,
        'xAxisLabel': '',
        'yAxisLabel': '',
        'dataColors':d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
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
        'dataColors':d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),//example ["red", "#555"]
        'duration': 1000,
        'curve': this.curveArray[0].d3Curve
    };

    public lineOptions2: any = {
        'backgroundColor': '#ffffff',//Text font inside the charts
        'textSize': "12px",
        'textColor': '#000',
        'isLegend': false,
        'legendPosition': 'right',//left | right 
        'isZoom': true,
        'xAxisLabel': 'Date',
        'yAxisLabel': 'Value',
        'dataColors':d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),//example ["red", "#555"]
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
        'dataColors':d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
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
        'dataColors':d3.scaleOrdinal().range(["rgba(0,136,191,0.8)", "rgba(152, 179, 74,0.8)", "rgba(246, 187, 66,0.8)", "#cc4748 ", "#cd82ad ", "#2f4074 ", "#448e4d ", "#b7b83f ", "#b9783f ", "#b93e3d ", "#913167 "]),
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
    public topologyOptions: any = {
        'backgroundColor': '#ffffff',
        'nodeTextSize': "14px",
        'nodeTextColor': '#000',
        'linkTextSize': "14px",
        'linkTextColor': '#000',
        'duration': 1000,
        'strength': -5000,//less value => more distance between nodes, default -5000
        'linkColor': "#555",
        'arrowColor': "#555",
        'nodeLabelField': "ip_address", // from dataset-servise || topology.json  (in properties)
        'linkLabelField': "bitrate", // you can use null => without link label   (in properties)
        'linkTooltioLabelFields': ["status", "nlq", "latency", "lq", "admin_state_up", "bitrate"],
        'nodeTooltipLabelFields': ["ip_address", "mac_address", "alerts"]
    };

    constructor(private router: Router, private alertSummaryService: AlertSummaryService,
        private ref: ChangeDetectorRef, private datasetService: DatasetService,private eventSummaryService: EventSummaryService) {
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

    ngOnInit() {
        this.getAllData();
        this.callAlerts();
        this.callEvents();
    }

    callEvents() {
        this.eventSummaryService.getEventSummary().subscribe(
            data => {
                this.pageIndex = 1;
                this.initialEventList = data;
                this.eventList = this.createPageChunk(data);
            },
            () => console.log('Finished')
        );
    }
    callAlerts() {
        this.alertSummaryService.getAlertSummary().subscribe(
            data => {
                this.alertList = this.getAlertList(data["alerts"][0]);
            },
            () => console.log('Finished')
        );
    }

    createPageChunk(data: any[]): any[] {
        if (data) {
            this.totalPages = _.ceil(data.length / this.itemsPerPage);
            return _.chunk(data || [], this.itemsPerPage)[this.pageIndex - 1];
        }
        return null;
    }

    getAlertList(data: any[]): any[] {
        let alerts:any[] = [];
        let alertsServer:any[] = [];
        let alertsApplication:any[] = [];
        
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
        
        return alerts;
    }

    changeTab(selectedTab) {
        if (this.currentTab !== selectedTab) {
            this.currentTab = selectedTab;
            //this.getAllData();
        }
    }
    getAllData() {
        this.datasetService.getServiceData();
    }    
}
