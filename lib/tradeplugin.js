class TradePlugin extends EntityPluginBase {
    constructor(trade_list=[]) {
        super();

        this.__trades__ = trade_list;
    }

    //#region [GET/SET]
    get trade_list() { return this.__trades__ }
    set trade_list(tl) { this.__trades__ = tl }
    //#endregion

    /**
     * Get trade list with given filters.
     * 
     * @param {Boolean} includeDisabled - If include disabled trades
     * @param {Boolean} includeInvisible - If include invisible trades
     * @returns {[TradeBase]} Trade list
     */
    getTrades(includeDisabled=true, includeInvisible=true) {
        return this.__trades__.filter(t => (includeDisabled || t.enabled) && (includeInvisible || t.visible));
    }

    /**
     * Add trade in trade_list.
     * 
     * @param {TradeBase} trade - TradeBase instance
     */
    addTrade(trade) {
        if(!(trade instanceof TradeBase)) throw TypeError("Must inherit from TradeBase.");
        this.__trades__.push(trade);
    }

    /**
     * Remove the given trade from trade_list.
     * 
     * @param {Number | String} trade_id - Id of trade instance
     */
    removeTrade(trade_id) {
        this.__trades__ = this.__trades__.filter(t => t.id === trade_id || (t.id instanceof Number && trade_id === t.id.toString()));
    }
}

class TradeBase {
    constructor(id=null, visible=true, enabled=true) {
        this.id = id || 'Td'+(new Date().getTime()*10 + parseInt(Math.random()*9)).toString(36);

        this.__is_visible__ = visible;
        this.__is_enabled__ = enabled;

        this.__can_trade_rule__ = () => { return true };
    }

    //#region [GET/SET]
    get visible() { return this.__is_visible__ }
    set visible(vs) { this.__is_visible__ = vs }

    get enabled() { return this.__is_enabled__ }
    set enabled(en) { this.__is_enabled__ = en }

    get can_trade() { return this.__can_trade_rule__(this) }
    set can_trade(ct) { this.__can_trade_rule__ = ct }

    get trade() { return this.__trade__ }
    set trade(td) { this__trade__ = td; }
    //#endregion
}