import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';

import { CdkTableModule } from '@angular/cdk/table';

import {
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatPaginatorModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule
} from '@angular/material';

import { NgxChartsModule } from '@swimlane/ngx-charts';

import { RiskResService } from '../../api/risk_res/risk_res.service';
import { AnalyticsService } from '../../api/analytics/analytics.service';
import { PyAnalyticsService } from '../../api/py_analytics/py-analytics.service';
import { RiskResDataComponent } from '../risk-res-data/risk-res-data.component';
import { SurveyDataComponent } from '../survey-data/survey-data.component';
import { DateRangeModule } from '../date-range/date-range.module';
import { AnalyticsComponent } from './analytics.component';
import { analyticsRoutes } from './analytics.routes';


@NgModule({
  declarations: [AnalyticsComponent, RiskResDataComponent, SurveyDataComponent],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule, RouterModule.forChild(analyticsRoutes),

    FlexLayoutModule,

    CdkTableModule,

    MatButtonModule, MatCardModule, MatDatepickerModule,
    MatExpansionModule, MatFormFieldModule, MatInputModule,
    MatPaginatorModule, MatSnackBarModule, MatTableModule,
    MatTabsModule, NgxChartsModule,

    DateRangeModule
  ],
  // entryComponents: [AnalyticsComponent],
  // bootstrap: [AnalyticsComponent],
  // exports: [AnalyticsComponent],
  providers: [
    RiskResService, AnalyticsService, PyAnalyticsService
  ]
})
export class AnalyticsModule {}