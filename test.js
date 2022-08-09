class Player extends EntityBase {
    constructor(name) {
        super([LevelPlugin, HealthPlugin, InventoryPlugin, SkillPlugin]);
        this.name = name;

        this.addSkill(new Tackle);
    }
}

class Tackle extends SkillBase {
    constructor() {
        super('tackle');
        this.power = 10;
    }
}