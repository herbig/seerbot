/**
 * @typedef {Object} Card
 * @property {number} id
 * @property {string} name
 * @property {SetCode} setCode
 * @property {Rarity} rarity
 * @property {Category} category
 * @property {Type[]} types
 * @property {string[]} subtypes
 * @property {string} manaCost
 * @property {Threshold} threshold
 * @property {Element[]} elements
 * @property {number|null} power
 * @property {number|null} life
 * @property {string} rulesText
 * @property {string} flavorText
 * @property {string} typeLine
 * @property {string} artist
 * @property {Finish[]} finishes
 * @property {boolean} isFirstPrinting
 */

/**
 * @typedef {Object} Threshold
 * @property {number} air
 * @property {number} earth
 * @property {number} fire
 * @property {number} water
 */

/**
 * @typedef {Object} Finish
 * @property {FinishType} type
 * @property {number|null} tcgPlayerId
 * @property {number|null} lowPriceUSD
 */

/**
 * @enum {string}
 */
const Rarity = {
    ORDINARY: "ORDINARY",
    EXCEPTIONAL: "EXCEPTIONAL",
    ELITE: "ELITE",
    UNIQUE: "UNIQUE"
};

/**
 * @enum {string}
 */
const Element = {
    AIR: "AIR",
    EARTH: "EARTH",
    FIRE: "FIRE",
    WATER: "WATER"
};

/**
 * @enum {string}
 */
const Category = {
    AVATAR: "AVATAR",
    SITE: "SITE",
    SPELL: "SPELL"
};

/**
 * @enum {string}
 */
const Type = {
    MINION: "MINION",
    AURA: "AURA",
    MAGIC: "MAGIC",
    ARTIFACT: "ARTIFACT"
};

/**
 * @enum {string}
 */
const SetCode = {
    APP: "APP", // alpha pledge pack
    APC: "APC", // alpha precon deck
    ABT: "ABT", // alpha box topper
    P22: "P22", // various other 2022 promos
    ALP: "ALP", // alpha
    BET: "BET", // beta
    BBT: "BBT", // beta box topper
    P23: "P23" // various other 2023 promos
};

/**
 * @enum {string}
 */
const FinishType = {
    NONFOIL: "NONFOIL",
    FOIL: "FOIL"
};
