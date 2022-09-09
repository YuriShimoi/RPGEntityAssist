class BossPlugin extends EntityPluginBase {
    constructor(stages=null) {
        super();

        this.__stage__  = "";
        this.__stages__ = {};
        if(stages !== null) {
            if(stages.length >= 1) this.first_stage = stages[0];
            for(let stg in stages) {
                if(stages[stg] instanceof BossStageBase) {
                    this.__stages__[stages[stg].id] = stages[stg];
                }
                else {
                    this.__stages__[stages[stg].id] = new BossStageBase(stages[stg].id, stages[stg].values, stages[stg].next || null);
                }
            }
        }
        else this.first_stage = "";
    }

    //#region [GET/SET]
    get stage() { return this.__stages__[this.stage_id] }
    set stage(st) { this.stage_id = st.id }
    
    get stage_id() { return this.__stage__ }
    set stage_id(st) { this.__stage__ = st }

    get next_stage() { return this.stage !== ""? this.__stages__[this.stage?.next_stage] | null: null }
    //#endregion

    /**
     * Add a new stage with given values.
     * 
     * @param {String} stage_id - Index for stage
     * @param {Object} values - An dictionary with name and value
     * @param {String} next - Next stage to that one
     */
    addStage(stage_id, values, next=null) {
        if(!values || !(values.constructor == Object)) throw TypeError("Values must be an dictionary.");
        this.__stages__[stage_id] = new BossStageBase(this.stage_id, values, next);
        if(Object.keys(this.__stages__).length == 1) this.first_stage = stage_id;
    }

    /**
     * Get the actual stage, or requested one.
     * 
     * @param {String} stage_id - Index for stage **(default: actual stage)**
     * @returns {BossStageBase} Stage instance
     */
    getStage(stage_id=this.stage) {
        return this.__stages__[stage_id];
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

    //#region [GET/SET]
    get next_stage() { return this.__next_stage__ }
    set next_stage(ns) { this.__next_stage__ = ns }
    //#endregion
}