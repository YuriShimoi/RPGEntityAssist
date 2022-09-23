class QuestPlugin extends EntityPluginBase {
    constructor(quests=[]) {
        super();

        this.__quests__ = quests;
    }


}

class QuestTreeBase {
    constructor() {
        
    }
}

class QuestBase {
    constructor() {
        this.id = 'Qt'+(new Date().getTime()*10 + parseInt(Math.random()*9)).toString(36);
    }
}

class QuestPhaseBase {
    constructor() {
        
    }

    start() {

    }

    end() {

    }

    stop() {
        
    }
}