class DialogPlugin extends EntityPluginBase {
    constructor() {
        super();
        this.dialog = new DialogBase();
    }

    /**
     * Set dialogs using the format in documentation.
     * 
     * @param {Object} dialog_config - Must follow the right provided format in documentation
     */
    setDialogs(dialog_config) {
        if(dialog_config.constructor !== Object) throw TypeError("Must be an dictionary.");
        this.dialog = new DialogBase(dialog_config);
    }

    /**
     * Adds a new dialog line in dialog list.
     * 
     * @param {String} dialog_name - dialog identifier to be call when start
     * @param {Object} dialog_config - Must follow the right provided format
     */
    addDialog(dialog_name, dialog_config) {
        this.dialog.addDialog(dialog_name, dialog_config);
    }
}

class DialogBase {
    constructor(dialog_config=null) {
        if(dialog_config && dialog_config.constructor === Object) {
            for(let d in dialog_config) {
                this.__dialogs__ = {};
                this.#convert(d, dialog_config[d]);
            }
        }
        else this.__dialogs__ = dialog_config | {};

        this.dialog_pin = "";

        this.__quest_event__ = () => {};
        this.__reply_event__ = () => {};
    }

    //#region [GET/SET]
    get questionEvent() { return this.__quest_event__ }
    set questionEvent(qe) { this.__quest_event__ = qe }

    get replyEvent() { return this.__reply_event__ }
    set replyEvent(re) { this.__reply_event__ = re }
    //#endregion

    /**
     * Start a new dialog.
     * 
     * @param {String} dialog_name - Name of the dialog line
     */
    start(dialog_name) {
        this.dialog_pin = this.#pathBuild(dialog_name);
        this.options();
    }

    /**
     * Send questions to questionEvent.
     */
    options() {
        this.questionEvent(this.__dialogs__[this.dialog_pin].filter(d => !d.hidden).reduce((acc, d) => acc = {...acc, [d.index]: d.question}, {}));
    }

    /**
     * Go to the next dialog line based on given option and calls for replyEvent and questionEvent.
     * 
     * @param {Number} reply_index - Index of the question to be send
     * @returns {undefined | any} By default will return *undefined*, if its a dialog end will return the response value
     */
    next(reply_index) {
        let dialog = this.__dialogs__[this.dialog_pin][reply_index];
        let next_pin = dialog.next;

        this.replyEvent(dialog.reply);
        if(this.__dialogs__[next_pin] instanceof Array && this.__dialogs__[next_pin][0] instanceof DialogLineBase) {
            this.dialog_pin = next_pin;
            if(dialog.hide && !dialog.hidden) dialog.hidden = true;
            this.options();
        }
        else { // response
            this.dialog_pin = "";
            return this.__dialogs__[next_pin];
        }
    }

    /**
     * Adds a new dialog line in dialog list.
     * 
     * @param {String} path - dialog identifier to be call when start
     * @param {Object} config - Must follow the right provided format
     */
    addDialog(path, config) {
        if(typeof path != "string") throw("Name must be a string.");
        if(!(config && config.constructor instanceof object)) throw("Config must be an dictionary.");
        this.#buildLine(path, config);
    }

    #convert(path, config) {
        if(typeof config == "string") config = JSON.parse(config);
        if(!(config instanceof Array)) throw TypeError("Must be an list of dialogs.");

        return this.#buildLine(path, config);
    }

    #buildLine(path, config, response=null) {
        if(config instanceof Array && config[0].constructor === Object) {
            config.forEach((c, i) => {
                let next_path;
                if(typeof c.next == "string" || (c.next instanceof Array && typeof c.next[0] == "string")) {
                    next_path = this.#pathBuild(c.next);
                }
                else { // next is more lines
                    next_path = this.#pathBuild(path, i);
                }
                if(this.__dialogs__[path]) this.__dialogs__[path].push(new DialogLineBase(i, c.question, c.reply, next_path, c.hide));
                else this.__dialogs__[path] = [new DialogLineBase(i, c.question, c.reply, next_path, c.hide)];
                this.#buildLine(next_path, c.next, c.response);
            });
        }
        else if(response !== null) {
            this.__dialogs__[path] = response;
        }
    }

    #pathBuild(...paths) {
        return paths.toString();
    }
}

class DialogLineBase {
    constructor(index, question, reply, next=null, hide=null) {
        this.index    = index;
        this.question = question;
        this.reply    = reply;
        this.next     = next;

        this.hide   = hide;
        this.hidden = false;
    }
}
