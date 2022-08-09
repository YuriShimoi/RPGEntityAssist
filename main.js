/**
 * Base class that implements plugins, to use just make a new class that extends this class and pass the plugin list in super.
 */
class EntityBase {
    /**
     * Super constructor that implements the given list of plugins.
     * 
     * @param {[BaseEntityPlugin]} plugins - Array of plugins that inherit from BaseEntityPlugin 
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



class LevelPlugin extends BaseEntityPlugin {
    constructor() {
        super();
        this.__total_xp__ = 0;
    }
    
    //#region [GET/SET]
    get level() { return this.levelByXpFormula(this.__total_xp__) }
    set level(lv) { this.total_experience = this.xpByLevelFormula(lv) + this.experience }

    get experience() { return this.__total_xp__ - this.xpByLevelFormula(this.level) }
    set experience(xp) { this.__total_xp__ += xp - this.experience }

    get total_experience() { return this.__total_xp__ }
    set total_experience(xp) { this.__total_xp__ = xp }
    //#endregion

    /**
     * Function that calculates the level based on given total experience.
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
     * @param {Number} lv - Level
     * @returns Total experience calculated by level.
     */
    xpByLevelFormula(lv) {
        return Math.floor(lv*20);
    }
}