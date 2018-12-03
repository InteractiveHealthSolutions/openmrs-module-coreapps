import PatientFlagsController from './patientflags.controller';
import template from './patientflags.html';

export let PatientFlagsComponent = {
    template,
    controller: PatientFlagsController,
    selector: 'patientflags',
	scope: {},
    bindings: {
        config: '<'
    }
};