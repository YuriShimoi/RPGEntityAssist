class InventoryPlugin extends BaseEntityPlugin {
    constructor() {
        super();

        this.__main_inventory__ = new InventoryBase();
        this.__inventory_list__ = {};
    }

    //#region [GET/SET]
    get inventory() { return this.__main_inventory__ }
    set inventory(iv) { if(!(iv instanceof InventoryBase)) throw TypeError("Must inherit from InventoryBase."); this.__main_inventory__ = iv }

    get inventories() { return {'inventory': this.__main_inventory__, ...this.__inventory_list__} }
    //#endregion

    /**
     * Adds a new empty inventory with the given name.
     * 
     * @param {String} inventory_name
     * @returns {InventoryBase} The new empty inventory reference.
     */
    addInventory(inventory_name) {
        if(inventory_name === "inventory") throw ReferenceError(`New inventory cannot be called "inventory" because main inventory already uses that name.`);
        this.__inventory_list__[inventory_name] = new InventoryBase();
        return this.__inventory_list__[inventory_name];
    }

    /**
     * Removes the inventory with the given name.
     * 
     * @param {String} inventory_name
     */
    removeInventory(inventory_name) {
        if(inventory_name === "inventory") throw ReferenceError(`You can't delete "inventory" because main inventory uses that name.`);
        delete this.__inventory_list__[inventory_name];
    }
}

class InventoryBase {
    constructor() {
        this.id = 'I'+(new Date().getTime()*10 + parseInt(Math.random()*9)).toString(36);

    }
}

class InventoryItemGroupBase {

}

class InventoryItemBase {

}

class InventoryItemClassBase {

}