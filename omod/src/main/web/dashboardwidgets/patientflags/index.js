import angular from 'angular';
import ngSanitize from 'angular-sanitize';
import openmrsApi from '@openmrs/angularjs-openmrs-api';
import commons from './../dashboardwidgets.services';
import { PatientFlagsComponent } from './patientflags.component';

export default angular.module("openmrs-contrib-dashboardwidgets.patientflags", [ ngSanitize, openmrsApi, commons ])
	.component(PatientFlagsComponent.selector, PatientFlagsComponent).name;