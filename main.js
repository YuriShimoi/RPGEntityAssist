class EntityBase {
    /**
     * @param {[BaseEntityPlugin]} plugins - Array of plugins that inherit from BaseEntityPlugin 
     */
    constructor(plugins) {
        if(!(plugins instanceof Array)) throw TypeError("Plugins must be an array.");
        plugins.forEach(p => {
            let temp_instance = new p();
            if(!(temp_instance instanceof BaseEntityPlugin)) throw TypeError("Must inherit from BaseEntityPlugin.");
            this.#extendProperties(temp_instance);
        });
    }

    #extendProperties(plugin) {
        let injection = plugin.properties;
        for(let m in injection.method.key) {
            let method = injection.method.key[m];
            if(injection.method.key[m] === 'constructor') continue;
            this[method] = injection.method.val[method];
        }
        for(let p in injection.property.key) {
            let property = injection.property.key[p];
            this[property] = injection.property.val[property].value;
        }
    }
}

class BaseEntityPlugin {
    constructor(child_class=BaseEntityPlugin) {
        this.classToInherit = child_class;
    }

    get properties() {
        return {
            'property': {
                'key': Object.getOwnPropertyNames(new this.classToInherit()),
                'val': Object.getOwnPropertyDescriptors(new this.classToInherit())
            },
            'method': {
                'key': Object.getOwnPropertyNames(Object.getPrototypeOf(this)),
                'val': Object.getPrototypeOf(this)
            }
        };
    }
}

class LevelPlugin extends BaseEntityPlugin {
    level = 0;
    constructor(child_class=LevelPlugin) {
        super(child_class);
    }
}

class ExperiencePlugin extends BaseEntityPlugin {
    experience = 0;
    constructor(child_class=ExperiencePlugin) {
        super(child_class);
    }
}

class SkillPlugin extends BaseEntityPlugin {
    _skills = [1,2,3];
    constructor(child_class=SkillPlugin) {
        super(child_class);
    }

    get skill_list() {
        return this._skills;
    }

    test() {
        this._skills.push(parseInt(Math.random()*10+1));
        console.log("test");
    }
}