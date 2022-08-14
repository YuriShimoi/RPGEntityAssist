class Player extends EntityBase {
    constructor(name) {
        super([InventoryPlugin, LevelPlugin, HealthPlugin]);
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