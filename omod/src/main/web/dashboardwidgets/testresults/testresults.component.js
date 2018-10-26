import TestResultsController from './testresults.controller';
import template from './testresults.html';

export let TestResultsComponent = {
    template,
    controller: TestResultsController,
    selector: 'testresults',
    bindings: {
        config: '<'
    }
};