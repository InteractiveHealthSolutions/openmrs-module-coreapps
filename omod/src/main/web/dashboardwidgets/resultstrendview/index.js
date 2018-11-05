import angular from 'angular';
import openmrsApi from '@openmrs/angularjs-openmrs-api';
import commons from './../dashboardwidgets.services';
import { ResultsTrendViewComponent } from './resultstrendview.component';

export default angular.module("openmrs-contrib-dashboardwidgets.testresults71", [openmrsApi, commons])
	.component(ResultsTrendViewComponent.selector, ResultsTrendViewComponent).name;