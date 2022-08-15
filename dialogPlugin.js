class DialogPlugin extends EntityPluginBase {
    constructor(dialogs=[]) {
        super();

        this.__dialogs__ = dialogs;
    }
}

class DialogLineBase {
    constructor() {
        
    }
}

class DialogBase {
    constructor() {
        
    }
}


/**
 * Input Example

{
    'first': [
        {
            'hey': {

            },
            'good night': {

            },
            'bye': {
                'okay, bye': null
            }
        }
    ]
}

*/