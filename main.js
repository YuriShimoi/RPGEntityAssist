/**
 * Base class that implements plugins, to use just make a new class that extends this class and pass the plugin list in super.
 */
class EntityBase {
    /**
     * Super constructor that implements the given list of plugins.
     * 
     * @param {BaseEntityPlugin[]} plugins - Array of plugins that inherit from BaseEntityPlugin 
     */
    constructor(plugins) {
        if(!(plugins instanceof Array))
            throw TypeError("Plugins must be an array.");
        plugins.forEach(p => {
            if(Object.getPrototypeOf(p) !== BaseEntityPlugin)
                throw TypeError(`[${p}] must inherit from BaseEntityPlugin.`);
            this.#extendProperties(p);
        });
    }

    #extendProperties(plugin) {
        let injection = new plugin().injection_descriptors;
        for(let p in injection.property.key) {
            let property = injection.property.key[p];
            this[property] = injection.property.val[property].value;
        }
        for(let m in injection.method.key) {
            let method = injection.method.key[m];
            if(!(method in this)) { // teorically do not implements BaseEntityPlugin constructor
                let descriptor = Object.getOwnPropertyDescriptor(injection.method.val, method);
                Object.defineProperty(this, method, descriptor);
            }
        }
    }
}



/**
 * Base Plugin that implements injection to pass properties to EntityBase, must be inherited on new Plugins.
 */
class BaseEntityPlugin {
    constructor() { }

    get injection_descriptors() {
        return {
            'property': {
                'key': Object.getOwnPropertyNames(new this.constructor()),
                'val': Object.getOwnPropertyDescriptors(new this.constructor())
            },
            'method': {
                'key': Object.getOwnPropertyNames(Object.getPrototypeOf(this)),
                'val': Object.getPrototypeOf(this)
            }
        };
    }
}



//#region Default Plugins
class LevelPlugin extends BaseEntityPlugin {
    constructor() {
        super();
        this.__total_xp__   = 0;
        this.__level_up__   = () => {};
        this.__level_down__ = () => {};
    }
    
    //#region [GET/SET]
    get level() { return this.levelByXpFormula(this.__total_xp__) }
    set level(lv) { this._checkLevelChange(() => { this.__total_xp__ = this.xpByLevelFormula(lv) + this.experience }) }

    get levelUpEvent() { return this.__level_up__ }
    set levelUpEvent(lu) { this.__level_up__ = lu }

    get levelDownEvent() { return this.__level_down__ }
    set levelDownEvent(ld) { this.__level_down__ = ld }

    get experience() { return this.__total_xp__ - this.xpByLevelFormula(this.level) }
    set experience(xp) { this._checkLevelChange(() => { this.__total_xp__ += xp - this.experience }) }

    get total_experience() { return this.__total_xp__ }
    set total_experience(xp) { this._checkLevelChange(() => { this.__total_xp__ = xp }) }
    //#endregion

    /**
     * Function that calculates the level based on given total experience.
     * 
     * *Overwrite this method to set a custom formula.*
     * *Alternatively you can also make some sort of hash table between xp and level.*
     * 
     * @param {Number} xp - Total experience
     * @returns Level calculated by total experience.
     */
    levelByXpFormula(xp) {
        return Math.floor(xp/20);
    }

    /**
     * Function that calculates the total experience based on given level plus remaining experience.
     * 
     * *Overwrite this method to set a custom formula.*
     * *Alternatively you can also make some sort of hash table between xp and level.*
     * 
     * @param {Number} lv - Level
     * @returns Total experience calculated by level.
     */
    xpByLevelFormula(lv) {
        return Math.floor(lv*20);
    }

    /**
     * Internal class that receives an function instance that changes the experience, if changes calls for level events.
     * 
     * *That's an internal function, you not supposed to be calling this, make sure you are not committing any mistake.*
     * 
     * @param {Function} xpMutation - Function instance to be run and is expected to change this.experience
     */
    _checkLevelChange(xpMutation) {
        let level_bef = this.level;
        xpMutation();
        let level_now = this.level;

        if(level_bef < level_now) {
            for(let level = level_bef+1; level <= level_now; level++) {
                this.levelUpEvent(level, this);
            }
        }
        else if(level_bef > level_now) {
            for(let level = level_bef-1; level >= level_now; level--) {
                this.levelDownEvent(level, this);
            }
        }
    }
}

class HealthPlugin extends BaseEntityPlugin {
    constructor() {
        super();
        this.__health__ = { 'remain': 100, 'max': 100 };

        this.__health_end__ = () => {};
    }

    //#region [GET/SET]
    get health() { return this.__health__.remain }
    set health(ht) { this.__health__.remain = ht; if(this.__health__.remain <= 0) this.healthEndEvent() }

    get max_health() { return this.__health__.max }
    set max_health(us) { this.__health__.max = us }

    get healthEndEvent() { return this.__health_end__ }
    set healthEndEvent(he) { this.__health_end__ = he }
    //#endregion

    /**
     * Restore the health to its max.
     */
    restoreHealth() {
        this.health = this.max_health;
    }
}
//#endregion