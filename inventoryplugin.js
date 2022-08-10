class InventoryPlugin extends BaseEntityPlugin {
    constructor() {
        super();

        this.__main_inventory__ = new InventoryBase("main");
        this.__inventory_list__ = {};
    }

    //#region [GET/SET]
    get inventory() { return this.__main_inventory__ }
    set inventory(iv) { if(!(iv instanceof InventoryBase)) throw TypeError("Must inherit from InventoryBase."); this.__main_inventory__ = iv }

    get inventories() { return {'main': this.__main_inventory__, ...this.__inventory_list__} }
    set inventories(iv) {
        for(let i in iv) {
            if(!(iv[i] instanceof InventoryBase)) throw TypeError("Must inherit from InventoryBase.");
        }
        this.__inventory_list__ = {...iv};
    }
    //#endregion

    /**
     * Adds given new inventory to this.inventories.
     * 
     * @param {String} inventory - Must be an instance that extends InventoryBase.
     */
    addInventory(inventory) {
        if(!(inventory instanceof InventoryBase)) throw TypeError("Must extends InventoryBase.");
        if(inventory.name === this.inventory.name)
            throw ReferenceError(`New inventory cannot be called "${this.inventory.name}" because main inventory already uses that name.`);
        this.__inventory_list__[inventory.name] = inventory;
    }

    /**
     * Removes the inventory with the given name.
     * 
     * @param {String} inventory_name - Inventory name used to evoke from this.inventories
     */
    removeInventory(inventory_name) {
        if(inventory_name === this.inventory.name) throw ReferenceError(`You can't delete "${this.inventory.name}" because main inventory uses that name.`);
        delete this.__inventory_list__[inventory_name];
    }
}

class InventoryBase {
    constructor(name, size=20) {
        this.id = 'Iv'+(new Date().getTime()*10 + parseInt(Math.random()*9)).toString(36);
        
        this.name = name;
        this.__size__ = size;
        this.__item_list__ = new Array(size);
    }

    //#region [GET/SET]
    get items() { return this.__item_list__ }
    set items(it) {
        it.forEach(i => {
            if(!(i instanceof InventoryItemStackBase)) throw TypeError("Must inherit from InventoryItemStackBase.")}
        );
        this.__item_list__ = [...it];
    }

    get size() { return this.__size__ }
    set size(sz) {
        this.__size__ = sz;
        if(this.__item_list__.length >= sz) this.__item_list__.splice(sz);
        else this.__item_list__.push(...new Array(sz - this.__item_list__.length));
    }
    //#endregion

    /**
     * Try add the item to the inventory, returns the amount added following the below logic:
     * - Search if already has any amount of the same item using *item.equalityCheck(item)*
     * that by default is "this.name === item.name", that method is supposed to be overwritten in inheritance if needed;
     * - Try add the amount to existent stack if exists, if has any or the amount reach the limit
     * search for the next stack or the first free index in the inventory;
     * - Loop trough first and second steps until all the required amount is over or has no space available.
     * 
     * @param {InventoryItemBase} item - Requires an instance to make use of *item.equalityCheck*
     * @param {Number} amount - Amount of items in stack **(default: 1)**
     * @param {Number} amount_limit - Amount limit for this item to stack **(default: 1)**
     * @param {Number} index - Forces the insertion to first of all try add in given index **(default: first same item)**
     * @returns {Number} Returns the amount of the item that could be inserted in the inventory
     */
    addItem(item, amount=1, amount_limit=1, index=null) {
        if(!(item instanceof InventoryItemBase)) throw TypeError("Must inherit from InventoryItemBase.");
        let inserted_amount = 0;

        // add to given index
        if(index !== null) {
            if(!this.items[index]) this.items[index] = new InventoryItemStackBase(item, 0, amount_limit);
            let stack      = this.items[index];
            let left_space = stack.amount_limit - stack.amount;

            left_space       = left_space > (amount - inserted_amount)? (amount - inserted_amount): left_space;
            inserted_amount += left_space;
            stack.amount    += left_space;
        }

        // search and add to existent equal items
        let same_item_in_inventory = this.items.filter(s => s?.item.equalityCheck(item));
        for(let s in same_item_in_inventory) {
            let stack      = same_item_in_inventory[s];
            let left_space = stack.amount_limit - stack.amount;

            left_space       = left_space > (amount - inserted_amount)? (amount - inserted_amount): left_space;
            inserted_amount += left_space;
            stack.amount    += left_space;
        }

        // add new stacks
        while(inserted_amount < amount) {
            let stack_amount = (amount - inserted_amount) > amount_limit? amount_limit: (amount - inserted_amount);
            let stack = new InventoryItemStackBase(item, stack_amount, amount_limit);
            if(!this.tryAddItemStack(stack)) break;
            inserted_amount += stack_amount;
        }
        
        return inserted_amount;
    }

    /**
     * Try add the stack of item to the inventory, returns *false* if couldn't insert.
     * 
     * @param {InventoryItemStackBase} stack - Must inherit from InventoryItemStackBase
     * @param {Number} index - Inventory index **(default: first free-only position)**
     * @param {Boolean} overwrite - If can overwrite another item, used only when specified an index **(default: false)**
     * @returns {Boolean} Returns if the item stack could be inserted in the inventory
     */
    tryAddItemStack(stack, index=null, overwrite=false) {
        if(!(stack instanceof InventoryItemStackBase)) throw TypeError("Must inherit from InventoryItemStackBase.");

        if(index) {
            if(!overwrite && this.items[index]) return false;
            try {
                this.items[index] = stack;
            }
            catch {
                throw RangeError(`Invalid index "${index}".`);
            }
            return true;
        }

        let firstFree = this.items.findIndex(i => !i);
        if(firstFree !== -1) this.items[firstFree] = stack;
        return firstFree !== -1;
    }

    /**
     * Removes the given item from the inventory.
     * 
     * @param {InventoryItemBase} item - Requires an instance to make use of *item.equalityCheck*
     * @param {Number} amount - Amount to delete **(default: all items found in inventory)**
     * @param {Boolean} delete_if_zero - Delete the stack if reach amount equals zero **(default: true)**
     * @returns {Number} Returns the amount of the item that could be removed from the inventory
     */
    removeItem(item, amount=null, delete_if_zero=true) {
        let removed_amount = 0;
        for(let s in this.items) {
            if(!this.items[s]?.item.equalityCheck(item)) continue;
            if(amount === null || this.items[s].amount <= (amount - removed_amount)) {
                removed_amount += this.items[s].amount;
                this.items[s].amount = 0;
                if(delete_if_zero) delete this.items[s];
            }
            else {
                this.items[s].amount -= amount - removed_amount;
                removed_amount = amount;
                break;
            }
        }

        return removed_amount;
    }

    /**
     * Search in the inventory for the given item and return the amount founded.
     * 
     * @param {*} item - Requires an instance to make use of *item.equalityCheck*
     * @returns {Number} Amount found in inventory
     */
    hasItem(item) {
        return this.items.reduce((acc, i) => acc += i?.item.equalityCheck(item)? i.amount: 0, 0);
    }

    /**
     * Remove items only in given index
     * 
     * @param {Number} index - Index in inventory
     * @param {Number} amount - Amount to delete **(default: all)**
     * @param {Boolean} delete_if_zero - Delete the stack if reach amount equals zero **(default: true)**
     */
    removeItemByIndex(index, amount=null, delete_if_zero=true) {
        if(!this.items[index]) return;
        this.items[index].amount -= amount || this.items[index].amount;
        if(delete_if_zero && this.items[index].amount <= 0) {
            delete this.items[index];
        }
    }

    /**
     * Move the item between given indexes, by default if has an item in the destiny index they will be moved to origin index.
     * 
     * @param {Number} from_index - Origin index
     * @param {Number} to_index - Destiny index
     * @param {Boolean} overwrite - If the "to" item must be overwrited
     * @returns {InventoryItemBase | null} Return the overwrited item if *overwrite* is set as true, else returns null
     */
    moveItem(from_index, to_index, overwrite=false) {
        let dump = this.items[to_index];

        this.items[to_index] = this.items[from_index];
        if(!overwrite) this.items[from_index] = dump;

        return dump;
    }
}

class InventoryItemStackBase {
    constructor(item, amount=1, amount_limit=10) {
        this.id = 'Ig'+(new Date().getTime()*10 + parseInt(Math.random()*9)).toString(36);

        this.__item__  = { 'value' : item, 'amount': amount > amount_limit? amount_limit: amount, 'limit': amount_limit };
        this.__item_over_event__ = () => {};
    }

    //#region [GET/SET]
    get item() { return this.__item__.value }
    set item(it) { if(!(it instanceof InventoryItemBase)) throw TypeError("Must inherit from InventoryItemBase"); this.__item__.value = it }

    get amount() { return this.__item__.amount }
    set amount(am) { this._checkAmountChange(() => {this.__item__.amount = am > this.amount_limit? this.amount_limit: am}) }
    
    get amount_limit() { return this.__item__.limit }
    set amount_limit(li) { this.__item__.limit = li }

    get itemIsOverEvent() { return this.__item_over_event__ }
    set itemIsOverEvent(oe) { this.__item_over_event__ = oe }
    //#endregion

    /**
     * Update all item parameters.
     * 
     * @param {IventoryItemBase} item - Item instance, must inherit from IventoryItemBase
     * @param {Number} amount - Amount of items in stack **(default: this.amount)**
     * @param {Number} amount_limit - Amount limit for this item to stack **(default: this.amount_limit)**
     */
    updateItem(item, amount=null, amount_limit=null) {
        this.__item__.value  = item;
        this.__item__.amount = amount || this.amount;
        this.__item__.limit  = amount_limit || this.amount_limit;
    }

    /**
     * Internal class that receives an function instance that changes the item amount, if changes calls for amount events.
     * 
     * *That's an internal function, you not supposed to be calling this, make sure you are not committing any mistake.*
     * 
     * @param {Function} amountMutation - Function instance to be run and is expected to change the item amount
     */
    _checkAmountChange(amountMutation) {
        let before_amount = this.amount;
        amountMutation();
        let now_amount = this.amount;

        if(before_amount !== now_amount) {
            if(now_amount <= 0) {
                this.itemIsOverEvent(this.item, this.amount, this.amount_limit);
            }
        }
    }
}

class InventoryItemBase {
    constructor(name="", description="") {
        this.id = 'It'+(new Date().getTime()*10 + parseInt(Math.random()*9)).toString(36);

        this.name = name;
        this.description = description;

        this.__categories__ = [];
    }

    //#region [GET/SET]
    get categories() { return this.__categories__ }
    set categories(ct) {
        for(let c in ct) {
            if(!(ct[c] instanceof InventoryItemCategoryBase)) throw TypeError("Must inherit from InventoryItemCategoryBase.");
        }
        this.__categories__ = {...ct};
    }
    //#endregion

    /**
     * Adds given new category to this.categories.
     * 
     * @param {InventoryItemCategoryBase} category - Must be an instance that extends InventoryItemCategoryBase
     */
    addCategory(category) {
        if(!(category.name instanceof InventoryItemCategoryBase)) throw TypeError("Must extends InventoryItemCategoryBase.");
        this.__categories__[category.name] = category;
    }

    /**
     * Removes the category with the given name.
     * 
     * @param {String} category_name - Category name used to evoke from this.categories
     */
    removeCategory(category_name) {
        delete this.__categories__[category_name];
    }

    /**
     * Checks the equality rule and returns if the given item is considered the same as this item.
     * 
     * @param {InventoryItemBase} item - Must inherit from InventoryItemBase
     * @returns If is the same item
     */
    equalityCheck(item) {
        return this.name === item.name;
    }
}

class InventoryItemCategoryBase {
    constructor(name="") {
        this.id = 'Ic'+(new Date().getTime()*10 + parseInt(Math.random()*9)).toString(36);

        this.name = name;
    }
}



class LootTablePlugin extends InventoryPlugin {
    constructor() {
        super();


    }
}