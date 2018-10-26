import angular from 'angular';
import openmrsApi from '@openmrs/angularjs-openmrs-api';
import commons from './../dashboardwidgets.services';

import { TestResultsComponent } from './testresults.component';

export default angular.module("openmrs-contrib-dashboardwidgets.testresults", [ openmrsApi, commons ])
	.component(TestResultsComponent.selector, TestResultsComponent).name;