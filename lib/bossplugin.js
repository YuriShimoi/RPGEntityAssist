class BossPlugin extends HealthPlugin {
    constructor(stages=null) {
        super();

        this.stage = "";
        this.__stage__ = {};
        if(stages !== null) {
            for(let stg in stages) {
                if(stages[stg] instanceof BossStageBase) {
                    this.__stage__[stages[stg].id] = stages[stg];
                }
                else {
                    this.__stage__[stages[stg].id] = new BossStageBase(stages[stg].id, stages[stg].values, stages[stg].next || null);
                }
            }
        }
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
    constructor(id, values, next=null) {
        this.id = id;
        this.__next_stage__ = next;

        for(let v in values) {
            if(!(v in this)) this[v] = props[v];
        }
    }

    get next_stage() { return this.__next_stage__ }
    set next_stage(ns) { this.__next_stage__ = ns }
}