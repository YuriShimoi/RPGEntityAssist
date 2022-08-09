class SkillPlugin extends BaseEntityPlugin {
    constructor() {
        super();
        this.__skill_list__ = [1, 2, 3];
    }

    get skill_list() { return this.__skill_list__ }

    learnSkill(skill) {
        if(!(skill instanceof SkillBase)) throw TypeError("Must be an skill that inherits from SkillBase.");
        this.__skill_list__.push(skill);
    }
}



class SkillBase {
    constructor(name="", description="") {
        this.id = 'S'+(new Date().getTime()*10 + parseInt(Math.random()*9)).toString(36);

        this.name = name;
        this.description = description;
    }
}