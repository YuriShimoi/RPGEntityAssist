# RPG Entity Assistance

Most of basic implementations in RPG-like games are pretty much the same, things like health control, xp and level, etc. This basic framework works as a pattern for highly generic customizable code for fast building any RPG-like architecture.
The usability is based on [base-class inheritance](#entity-base) and [plugins](#plugins) that work as modules, you can check for some implementation examples in *test.js* file, be confident that you can use your already made code if has any, and just add the plugins you need as long your entities inherit from [EntityBase](#entity-base) class, same way implementations like **item classes** have a base class that can be inherited to easily convert to a framework readable object.

---

## How To Start

First of all, i highly reccomend you to inherit from [EntityBase](#entity-base) and create your own classes, they do not implements anything more but the plugins and the internal features to make things work, if you need to set any custom properties like *name*, *id*, *hero class*, etc, you must create that by you own since that properties are easy and fast to set and not generic for many games.
Warnings given, i must explain the two *base classes* the framework provides in *lib/main.js*.

### Entity Base

That class covers the plugin exportation and [localStorage data saving](#on-promise-save), keeping simple, below here is a snippet for a *Player* class that inherit from **EntityBase** and implements *level* and *health* plugins, both already declared on *main.js*.

```js
class Player extends EntityBase {
    constructor(name) {
        super([LevelPlugin, HealthPlugin]);
        this.name = name;
    }
}
```

```js
// Player has access from all internal and listed plugins
let hero = new Player("Hero");

console.log(hero.name);                  // Property from Player class
>> "Hero"
console.log(hero.level);                 // Property from LevelPlugin
>> 0
console.log(hero.levelByXpFormula(100)); // Method from LevelPlugin
>> 5
console.log(hero.health);                // Property from HealthPlugin
>> 100
console.log(hero.restoreHealth());       // Method from HealthPlugin
>> 100
```

#### On promise Save

The **EntityBase** has an implementation to save properties in *localStorage* just as changes are made, to use this setting you have to pass an **uid** as second argument on *super constructor*, also you have to use **[EntityPluginBase](#entity-plugin-base)** to implement the custom properties you want to save they.

```js
class Player extends EntityBase {
    constructor(uid, name) {
        super([LevelPlugin, HealthPlugin], uid);
        this.name = name;
    }
}
```

```js
let hero = new Player("hero.principal", "Hero");
console.log(hero.level);
>> 0
hero.level = 1;

// Refreshes the page
let hero = new Player("hero.principal", "Hero");
console.log(hero.level);
>> 1
```

> Keep in mind if you clear the cache ow run an *localStorage.clear()* all the data will be discarted.

### Entity Plugin Base

If you want to implement a new custom plugin you need to inherit from **EntityPluginBase**, that class just holds an getter *injection_descriptors* used to inject methods and properties into **EntityBase**.
Here has an rule where if you want to implement your property with support to [localStorage data saving](#on-promise-save), you have to make a *getter/setter* to the property, this is necessary to the framework keep tracking the updates and save *on promise*.

```js
class Player extends EntityBase {
    constructor(uid, name) {
        super([CustomPlugin], uid);
        this.name = name;
    }
}

class CustomPlugin extends EntityPluginBase {
    __money__ = 0;
    get money() { return this.__money__; }
    set money(mn) { this.__money__ = mn; }
}
```

```js
let hero = new Player("hero.principal", "Hero");
console.log(hero.money);
>> 0
hero.money = 100;

// Refreshes the page
let hero = new Player("hero.principal", "Hero");
console.log(hero.money);
>> 100
```

---

## Plugins

Excepting [LevelPlugin]() and [HealthPlugin]() that are included in *main.js*, every plugin must be imported, you can download the files you need or import directly from *git pages*.

`<script src="lib/<plugin_file>.js"></script>`
`<script src="https://yurishimoi.github.io/RPGEntityAssist/lib/<plugin_file>.js"></script>`

### Boss Plugin

File: **bossplugin.js**

Module with stages control, has a list of stages where each stage holds properties and points to the next stage id.

| Properties  | Return |
|     :-:     |    -   |
| first_stage | **String** |
|    stage    | **BossStageBase** |
|   stage_id  | **String** |
|  next_stage | **BossStageBase** |

|   Methods  | Arguments | Return |
|     :-:    |     -     |   -    |
| addStage() | stage_id **String**, values **Dictionary**, next **String (default: null)** |
| getStage() | stage_id **String (default: this.stage)** | **BossStageBase** |

#### Boss Stage Base

Receives a dictionary on instance creation and set as properties.

| Properties  | Return |
|     :-:     |    -   |
| next_stage  | **String** |

### Dialog Plugin

File: **dialogplugin.js**

Module to build dialog schemes, converts **JSON-like** format to intuitive object control.

|  Properties   | Return |
|      :-:      |    -   |
|    dialog     | **DialogBase** |

|    Methods   | Arguments | Return |
|      :-:     |     -     |   -    |
| setDialogs() | dialog_config **Dictionary** |
| addDialog()  | dialog_name **String**, dialog_config **Dictionary** |

#### Dialog Format

Each dialog is composed by a collection of dialog lines, that has some properties.
Whenever a dialog starts some dialog lines return they response, for each dialog line **question** is the *option text*, when selected returns the **reply** as a *response-text* and so must return the **response** *value* or send the dialog to the **next** *dialog line list*.
Has three valid formats to a dialog list, an *Array* of new *dialog lines*, an *String* with the **dialog id** of any declared dialog, or an *Array* with the format **[\<dialog-id\>, ...\<option-index\>]** where *option-index* can be various in order to iterate in the *dialog lines*.

```html
{
    <dialog-id>: [
        {
            question: <option-text>,
            reply: <response-text>,
            hide: <boolean>,
            response: <value>,
            next: <dialog-id> or [<dialog-id>, ...<option-index>] or [
            {<dialog-line>...},
            ...
        ]},
        ...
    ]
}
```

<details>
<summary><b>Implementation Example</b></summary>

<table>

<tr>
<td>

![image](./dialogexample.png)

</td>
</tr>

<tr>
<td>

```js
const dialogs = {
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
```

</td>
</tr>

</table>

```js
class Npc1 extends EntityBase {
    constructor() {
        super([DialogPlugin]);
        this.setDialogs(dialogs);
        this.dialog.replyEvent    = (r) => { console.log("reply:", r) };
        this.dialog.questionEvent = (q) => { console.log("options:", q) };
    }
}
```

```js
let npc = new Npc1();
npc.dialog.start('dialog.first');
>> "options: {0: 'hey', 1: 'good night', 2: 'bye'}"

npc.dialog.next(1);
>> "reply: it's daytime"
>> "options: {0: 'hey', 2: 'bye'}"

npc.dialog.next(0);
>> "reply: hey, what can i help?"
>> "options: {0: 'need supplies', 1: 'nothing, bye'}"

npc.dialog.next(1);
>> "reply: are you sure?"
>> "options: {0: 'no', 1: 'yes'}"

npc.dialog.next(0);
>> "reply: undefined"
>> "options: {0: 'hey', 2: 'bye'}"

npc.dialog.next(0);
>> "reply: hey, what can i help?"
>> "options: {0: 'need supplies', 1: 'nothing, bye'}"

let response = npc.dialog.next(0);
>> "reply:  ok, here"
console.log(response);
>> 1
```

---

</details>

#### Dialog Base

|  Properties   | Return |
|      :-:      |    -   |
| questionEvent | **Function** |
|  replyEvent   | **Function** |

|   Methods   | Arguments | Return |
|     :-:     |     -     |   -    |
| addDialog() | path **String**, config **Dictionary** |
|    next()   | reply_index **Number** | **undefined \| any** |
|  options()  |
|   start()   | dialog_name **String** |

### Health Plugin

File: **main.js**

Module that provides support to health and trigger a custom *zero-health* event.

|  Properties    | Return |
|      :-:       |    -   |
|     health     | **Number** |
|  max_health    | **Number** |
| healthEndEvent | **Function** |

|     Methods     | Arguments | Return |
|       :-:       |     -     |   -    |
| restoreHealth() |           | **Number** |

### Inventory Plugin

File: **inventoryplugin.js**



#### Inventory Base

#### Inventory Item Base

#### Inventory Item Category Base

#### Inventory Item Modifier Base



### Level Plugin

File: **main.js**



### LootTable Plugin

File: **inventoryplugin.js**



#### LootTable Base



### Quest Plugin

File: **questplugin.js**



#### Quest Base

#### Quest Line Base



### Skill Plugin

File: **skillplugin.js**



#### Skill Base



### TradePlugin

File: **tradeplugin.js**



#### Trade Base
