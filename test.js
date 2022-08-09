class Player extends EntityBase {
    constructor(name) {
        super([LevelPlugin, SkillPlugin]);
        this.name = name;
    }
}