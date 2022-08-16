class BossPlugin extends HealthPlugin {
    constructor() {
        super();

        this.stage = "";
        this.__stage__ = {};
        this.first_stage = "";
    }

    get nextStage() { return this.stage !== ""? this.__stage__[this.__stage__[this.stage]?.next_stage] | null: null }

    /**
     * Add a new stage with given values.
     * 
     * @param {String} stage_id - Index for stage
     * @param {Object} values - An dictionary with name and value
     * @param {String} next_stage - Next stage to that one
     */
    addStage(stage_id, values, next_stage=null) {
        if(!values || !(values.constructor == Object)) throw TypeError("Values must be an dictionary.");
        this.__stage__[stage_id] = new BossStageBase(this.stage_id, values, next_stage);
        if(Object.keys(this.__stage__).length == 1) this.first_stage = stage_id;
    }

    /**
     * Get the actual stage, or requested one.
     * 
     * @param {String} stage_id - Index for stage **(default: actual stage)**
     * @returns {BossStageBase} Stage instance
     */
    getStage(stage_id=this.stage) {
        return this.__stage__[stage_id];
    }
}

class BossStageBase {
    constructor(id, props, next=null) {
        this.id = id;
        for(let p in props) {
            this[p] = props[p];
        }

        this.__next_stage__ = next;
    }

    get next_stage() { return this.__next_stage__ }
    set next_stage(ns) { this.__next_stage__ = ns }
}