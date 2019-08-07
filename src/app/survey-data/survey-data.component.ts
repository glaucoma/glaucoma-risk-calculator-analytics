import { Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

import { ISurvey } from '../../api/analytics/analytics.services.d';

@Component({
  selector: 'app-survey-data',
  templateUrl: './survey-data.component.html',
  styleUrls: ['./survey-data.component.css']
})
export class SurveyDataComponent {
  @Input('dataSource') dataSource: MatTableDataSource<ISurvey>;

  displayedColumns: string[] = [
    'id',
    'perceived_risk',
    'recruiter',
    'eye_test_frequency',
    'glasses_use',
    'behaviour_change',
    'risk_res_id',
    'createdAt',
    'updatedAt'
  ];
}