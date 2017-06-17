import { Pipe, PipeTransform } from '@angular/core';
import { AlertSummary } from '../model/alertSummary-model';
@Pipe({
    name: 'alertfilter',
    pure: false 
})
export class AlertFilterPipe implements PipeTransform {
  transform(items: AlertSummary[], filter: AlertSummary): AlertSummary[] {
    if (!items || !filter) {
      return items;
    }
    // filter items array, items which match and return true will be kept, false will be filtered out
    return items.filter((item: AlertSummary) => this.applyFilter(item, filter));
  }
  
  /**
   * Perform the filtering.
   * 
   * @param {AlertSummary} alert The alert to compare to the filter.
   * @param {AlertSummary} filter The filter to apply.
   * @return {boolean} True if alert satisfies filters, false if not.
   */
  applyFilter(alert: AlertSummary, filter: AlertSummary): boolean {
    for (let field in filter) {
      if (filter[field]) {
        if (typeof filter[field] === 'string') {
          if (alert[field].toLowerCase().indexOf(filter[field].toLowerCase()) === -1) {
            return false;
          }
        } else if (typeof filter[field] === 'number') {
          if (alert[field] !== filter[field]) {
            return false;
          }
        }
      }
    }
    return true;
  }
}