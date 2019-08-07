import { AfterContentInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import { MediaChange, MediaObserver } from '@angular/flex-layout';

import { MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';

import { Subscription } from 'rxjs';

import * as math from 'mathjs';

import * as moment from 'moment-timezone';
import { Moment } from 'moment';

import { ISingleSeries, TRiskResRow } from '../../api/risk_res/risk_res.services.d';
import { IAnalyticsResponse, IRowWise, ISurvey } from '../../api/analytics/analytics.services.d';
import { AnalyticsService } from '../../api/analytics/analytics.service';
import { PyAnalyticsService } from '../../api/py_analytics/py-analytics.service';
import { IPyAnalyticsResponse } from '../../api/py_analytics/analytics.services';


@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, AfterContentInit, OnDestroy {
  risk_res_table: MatTableDataSource<TRiskResRow> = null;
  survey_table: MatTableDataSource<ISurvey> = null;

  age_distr: Array<{name: string, series: ISingleSeries[]}>;
  ethnicity_agg: ISingleSeries[];
  view: [number, number] = [250, 250];
  step_2: IAnalyticsResponse['step_2'];
  row_wise_age: IRowWise;
  row_wise_client_risk: IRowWise;
  row_wise_columns: string[];

  not_found_date_range = false;

  public selectedMoments: Moment[] = [
    moment('2019-03-11T08:00:00+11:00').tz('Australia/Sydney'),
    moment('2019-03-11T15:00:00+11:00').tz('Australia/Sydney')
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  watcher: Subscription;
  activeMediaQuery = '';
  group: FormGroup;
  pyAnalyticsData: IPyAnalyticsResponse;

  constructor(mediaObserver: MediaObserver,
              private router: Router,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private analyticsService: AnalyticsService,
              private pyAnalyticsService: PyAnalyticsService) {
    this.watcher = mediaObserver
      .asObservable()
      .subscribe((changes: MediaChange[]) => {
        const change: MediaChange = changes[changes.length - 1];
        this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : '';
        switch (change.mqAlias) {
          case 'gt-sm':
            this.view = [500, 500];
            break;
          case 'xs':
          case 'lt-sm':
          default:
            this.view = [250, 250];
          // console.info('change.mqAlias', change.mqAlias, ';');
        }
      });
  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }

  ngOnInit() {
    this.route
      .queryParamMap
      .subscribe(params => {
        if (params.has('from'))
          this.selectedMoments[0] = moment(params.get('from')).tz('Australia/Sydney');
        if (params.has('to'))
          this.selectedMoments[1] = moment(params.get('to')).tz('Australia/Sydney');

        const dt = new HttpParams()
          .set('from', encodeURIComponent(this.selectedMoments[0].toISOString(true)))
          .set('to', encodeURIComponent(this.selectedMoments[1].toISOString(true)));

        this.analyticsService
          .readAll(dt)
          .subscribe(analytics => {
            this.risk_res_table = new MatTableDataSource<TRiskResRow>(analytics.row_wise_stats.risk_res);
            this.risk_res_table.paginator = this.paginator;

            this.survey_table = new MatTableDataSource<ISurvey>(analytics.survey_tbl);
            this.risk_res_table.paginator = this.paginator;

            this.ethnicity_agg = analytics.ethnicity_agg;
            this.step_2 = analytics.step_2;
            this.row_wise_age = analytics.row_wise_stats.column.age;
            this.row_wise_client_risk = analytics.row_wise_stats.column.client_risk;
            this.row_wise_columns = Object.keys(analytics.row_wise_stats.column.age);
            this.graphInit();
            /*
            if (this.date_range_component != null)
              this.date_range_component.confirmSelectedChange
                .subscribe(n => this.toDateRange());
             */
            this.pyAnalyticsService
              .read(dt)
              .subscribe(data =>
                console.info('pyAnalyticsData._out:', data._out, ';'
                ) as any || (this.pyAnalyticsData = ((): IPyAnalyticsResponse => {
                  data.completed = parseFloat(math.multiply(data.completed, 100).toPrecision(5));
                  return data;
                })()));
          }, (err: HttpErrorResponse) => {
            if (err.status === 404) {
              this.not_found_date_range = true;
              this.snackBar
                .open('No data found', 'Choose different date range')
                .afterDismissed()
                .subscribe(() => /*this.date_range_component.confirmSelect()*/ void 0);
            }
            else console.error('AnalyticsComponent::ngOnInit::analyticsService.readAll(_)::err', err, ';');
          });
      });
  }

  ngAfterContentInit() {
    // this.date_range_component.open();
  }

  private graphInit() {
    const age_to_riskids = new Map<number, number[]>();
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(
      k => age_to_riskids.set(k, [])
    );
    const riskid_to_risk = new Map<number, TRiskResRow>();
    this.risk_res_table.data.forEach(risk_res => {
      riskid_to_risk.set(risk_res.id, risk_res);
      const k = Math.floor(risk_res.age / 10);
      age_to_riskids.set(k, age_to_riskids.get(k).concat(risk_res.id));
    });
    this.age_distr = Array
      .from(age_to_riskids.values())
      .map((risk_ids, idx) => ({
        name: (sr => `${sr}-${sr + 9}`)(idx * 10),
        series: risk_ids.map(k => (risk_res => ({
          name: risk_res.id.toString(),
          value: risk_res.age
        }))(riskid_to_risk.get(k)))
      }))
      .filter(o => o.series.length);
  }

  toDateRange() {
    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: {
          from: this.selectedMoments[0].toISOString(true),
          to: this.selectedMoments[1].toISOString(true)
        },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
  }
}