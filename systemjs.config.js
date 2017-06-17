/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  System.config({
    transpiler: 'typescript',
    paths: {
      // paths serve as alias
      'npm:': 'node_modules/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      app: 'app',

      // angular bundles
      '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',

      // other libraries
      'rxjs': 'npm:rxjs',
      'core-js-shim': 'npm:core-js/client/shim.min.js',
      'zone': 'npm:zone.js/dist/zone.js',
      'reflect': 'npm:reflect-metadata/Reflect.js',
      'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
      
      'jquery': 'npm:jquery',
      'angular2-notifications': 'npm:angular2-notifications',
      'angular2-highcharts': 'npm:angular2-highcharts',
      'highcharts': 'npm:highcharts',
      'd3': 'npm:d3/build',
      'lodash': 'npm:lodash',
      'moment': 'npm:moment',
      'save-svg-as-png': 'npm:save-svg-as-png',
      'bootstrap-daterangepicker': 'npm:bootstrap-daterangepicker',
      'ng2-daterangepicker': 'npm:ng2-daterangepicker',
      'ng2-pagination': 'npm:ng2-pagination',
      "ng2-tooltip": "node_modules/ng2-tooltip"
    },
    meta: {},
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './main.js',
        defaultExtension: 'js'
      },
      rxjs: {
        main: 'Rx.js',
        defaultExtension: 'js'
      },
       'angular2-in-memory-web-api': {
        main: './index.js',
        defaultExtension: 'js'
      },
      'jquery': {
        main: 'dist/jquery',
        defaultExtension: 'js'
      },
      'angular2-notifications': {
        main: 'components.js',
        defaultExtension: 'js'
      },
      'angular2-highcharts': {
        main: './index.js',
        format: 'cjs',
        defaultExtension: 'js'
      },
      'highcharts': {
        // NOTE: You should set './highcharts.src.js' here
        // if you are not going to use <chart type="StockChart"
        main: './highstock.src.js',
        defaultExtension: 'js'
      },
      'd3': {
        main: 'd3',
        defaultExtension: 'js'
      },
      'save-svg-as-png': {
        main: 'saveSvgAsPng',
        defaultExtension: 'js'
      },
      'bootstrap-daterangepicker': {
        main: 'daterangepicker',
        defaultExtension: 'js'
      },
      'ng2-daterangepicker': {
        main: 'index',
        defaultExtension: 'js'
      },
      'lodash': {
        main: 'lodash',
        defaultExtension: 'js'
      },
      'moment': {
        main: 'moment',
        defaultExtension: 'js'
      },
      'ng2-pagination': {
        main: 'dist/ng2-pagination',
        defaultExtension: 'js'
      },
      "ng2-tooltip": {
        main: "index.js",
        defaultExtension: "js"
      }
    }
  });
})(this);
