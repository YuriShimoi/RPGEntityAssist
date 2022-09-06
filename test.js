class Player extends EntityBase {
    constructor(name) {
        super([HealthPlugin, LevelPlugin, InventoryPlugin]);
        this.name = name;
        this.inventory.addItem(new VampireDagger('Vampire Dagger', ""), 1, 1);
    }
}

class VampireDagger extends InventoryItemBase {
    constructor(name, description) {
        super(name, description, new ModifierVampirism(10));
        this.addCategory(new VampiricClass('Vampiric'));
    }
}

class VampiricClass extends InventoryItemCategoryBase {
    constructor(name) {
        super(name, new ModifierVampiricClass(5, 10, 7));
    }
}

class ModifierVampirism extends InventoryItemModifierBase {
    constructor(power) {
        super({'life-steal': power});
        this.name = "Vampirism";
    }
}

class ModifierVampiricClass extends InventoryItemModifierBase {
    constructor(ls, hb, st) {
        super({'life-steal': ls, 'health-bonus': hb, 'strengh': st});
        this.name = "Vampiric Class";
    }
}



class NPC1 extends EntityBase {
    constructor(name="NPC1") {
        super([DialogPlugin]);
        this.name = name;
        this.setDialogs(NPC1dialogs);
        this.dialog.replyEvent    = (r) => { console.log(r) };
        this.dialog.questionEvent = (q) => { console.log(q) };
    }
}

const NPC1dialogs = {
    "dialog.first": [
        {question: "hey", reply: "hey, what can i help?", next: [
            {question: "need supplies", reply: "ok, here", response: 1},
            {question: "nothing, bye", reply: "are you sure?", next: ["dialog.first", 2]}
        ]},
        {question: "good night", reply: "it's daytime", next: "dialog.first", hide: true},
        {question: "bye", reply: "are you sure?", next: [
            {question: "no", next: "dialog.first"},
            {question: "yes", reply: "ok, bye", response: 0}
        ]}
    ]
};



class Goblin extends EntityBase {
    constructor(id) {
        super([HealthPlugin, BossPlugin, LootTablePlugin], id);

        this.addLoot(new VampireDagger('vdagger',''), 0.7);
    }
}

g = new Goblin('mygoblin1');