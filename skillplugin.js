class SkillPlugin extends EntityPluginBase {
    constructor() {
        super();
        this.__skill_list__  = {};
        this.__main_skills__ = [];
    }

    //#region [GET/SET]
    get skills() { return this.__skill_list__ }

    get main_skills() { return this.__main_skills__ }
    set main_skills(ms) { this.__main_skills__ = ms.map(s => this.skills[s]) }
    //#endregion

    /**
     * Add given new skill to this.skills.
     * 
     * @param {SkillBase} skill - Must be an instance that extends SkillBase
     */
    addSkill(skill) {
        if(!(skill instanceof SkillBase)) throw TypeError("Must extends SkillBase.");
        this.__skill_list__[skill.name] = skill;
    }

    /**
     * Removes the skill with the given name.
     * 
     * @param {String} skill_name - Skill name used to evoke from this.skills
     */
    removeSkill(skill_name) {
        delete this.__skill_list__[skill_name];
    }
}

class SkillBase {
    constructor(name="", description="") {
        this.id = 'Sk'+(new Date().getTime()*10 + parseInt(Math.random()*9)).toString(36);

        this.name = name || this.id;
        this.description = description;

        this.__level__  = 1;
        this.__power__  = 5;
        this.__effect__ = () => {};
        this.__usages__ = { 'remain': 5, 'max': 5 };
    }

    //#region [GET/SET]
    get special_effect() { return this.__effect__ }
    set special_effect(se) { this.__effect__ = se }

    get usages() { return this.__usages__.remain }
    set usages(us) { this.__usages__.remain = us }
    
    get max_usages() { return this.__usages__.max }
    set max_usages(us) { this.__usages__.max = us }

    get power() { return this.getPower() }
    set power(pw) { this.__power__ = pw }

    get level() { return this.__level__ }
    set level(lv) { this.__level__ = lv }
    //#endregion

    /**
     * Restore the usages to its max.
     */
    restoreUsages() {
        this.usages = this.max_usages;
    }

    /**
     * Returns the skill power.
     * 
     * @param {Number} bonus - bonus power **(default: 0)**
     * @param {Number} multiplier - multiplier for power + bonus **(default: multiplierByLevelFormula(this.level))**
     * @returns (power + bonus) * multiplier
     */
    getPower(bonus=0, multiplier=this.multiplierByLevelFormula(this.level)) {
        return (this.__power__ + bonus) * multiplier;
    }

    /**
     * Returns a random number in the given range.
     * 
     * @param {Number} min - min value **(default: 1)**
     * @param {Number} max - max value **(default: 5)**
     * @returns Random number between min and max, both included.
     */
    getRandomBonus(min=1, max=5) {
        return parseInt(Math.random() * (max - min) + min);
    }

    /**
     * Function that calculates the power multiplier based on given level.
     * 
     * @param {Number} lv - Level **(default: this.level)**
     * @returns Muliplier calculated by level.
     */
    multiplierByLevelFormula(lv=this.level) {
        return 2**(lv-1);
    }
}