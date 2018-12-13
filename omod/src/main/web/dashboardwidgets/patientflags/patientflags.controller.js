export default class PatientFlagsController {
    constructor($filter, $sce, openmrsRest, widgetsCommons) {
        'ngInject';

        Object.assign(this, {$filter, $sce, openmrsRest, widgetsCommons });
    }

    $onInit() {
        this.openmrsRest.setBaseAppPath("/coreapps");
        
        this.flags = [];

        this.openmrsRest.list("patientflags", {patient: this.config.patientUuid, v: 'full'}).then((data) => {
            this.flags = data.results;
        });
    }
    
    formatFlagMessage(message){
    	var element = angular.element('<p>'+message+'</p>');
    	return element.html();
    }
}