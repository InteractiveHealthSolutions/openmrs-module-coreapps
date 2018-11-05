import ResultsTrendViewController from './resultstrendview.controller';
import template from './resultstrendview.html';

export let ResultsTrendViewComponent = {
    template,
    controller: ResultsTrendViewController,
    selector: 'resultstrendview',
    bindings: {
        config: '<'
    }
};