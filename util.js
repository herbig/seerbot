import removeAccents from 'remove-accents';

export const Color  = Object.freeze({
    EARTH: '#A79E81',
    AIR: '#ACB4D4',
    FIRE: '#E06638',
    WATER: '#7BBDD9',
    COLORLESS: '#221B17',
    GOLD: '#CCAC47',

    SUCCESS: '#674071',
    FAIL: '#3F4248',
});

export function accentColor(elements) {
    if (elements.length === 0) {
        return Color.COLORLESS;
    } else if (elements.length === 1) {
        return Color[elements[0].toUpperCase()];
    } else {
        return Color.GOLD;
    }
}

export const blockPriceInfo = [
    '769359301466652693', // Official Sorcery Discord
];

export const SetCode  = Object.freeze({
    APP: 'Alpha Pledge Pack',
    APC: 'Alpha Precon',
    ABT: 'Alpha Box Topper',
    P22: '2022 Promo',
    ALP: 'Alpha',
    BET: 'Beta',
    BBT: 'Beta Box Topper',
    P23: '2023 Promo',
});

const ElementEmoji  = Object.freeze({
    EARTH: '<:t_earth:1210681878198353931>',
    FIRE: '<:t_fire:1210681555077435393>',
    WATER: '<:t_water:1210681879661903933>',
    AIR: '<:t_air:1210681551650558032>',
});

export function thresholdText(threshold) {
    return ElementEmoji.EARTH.repeat(threshold.earth) + 
        ElementEmoji.FIRE.repeat(threshold.fire) + 
        ElementEmoji.WATER.repeat(threshold.water) +
        ElementEmoji.AIR.repeat(threshold.air);
}

const ManaCostEmoji = [
    '<:m_00:1210681536802717697>',
    '<:m_01:1210681538077790221>',
    '<:m_02:1210681539554447431>',
    '<:m_03:1210681540586250322>',
    '<:m_04:1210681541647405076>',
    '<:m_05:1210681542808965200>',
    '<:m_06:1210681543924777091>',
    '<:m_07:1210681544960647269>',
    '<:m_08:1210681875492905031>',
    '<:m_09:1210681548089598003>',
    '<:m_X:1210681877032206336>',
];

export function costEmoji(manaCost) {
    if (manaCost === '') return '';
    if (manaCost.toUpperCase() == 'X') return ManaCostEmoji[ManaCostEmoji.length - 1];
    return ManaCostEmoji[Number(manaCost)];
}

export function replaceManaSymbols(inputString) {
    return inputString.replace(/\(F\)/g, ElementEmoji.FIRE)
        .replace(/\(E\)/g, ElementEmoji.EARTH)
        .replace(/\(A\)/g, ElementEmoji.AIR)
        .replace(/\(W\)/g, ElementEmoji.WATER)
        .replace(/\(1\)/g, ManaCostEmoji[1])
        .replace(/\(2\)/g, ManaCostEmoji[2]);
}
  

/**
 * Normalize the card name to the same identifier that curiosa.io uses.
 */
export function cardSlug(name) {
    return removeAccents(name)
        .toLowerCase()
        .replace(/[\s\-]+/g, '_') // Replace spaces or dashes with underscores
        .replace(/[^a-zA-Z_]/g, ''); // Remove non-alphabetic characters (except for underscores)
}

/**
 * Sets an interval to randomly update the Discord activity status of the bot.
 */
export function randomizeActivity(discord) {

    const activities = [
        "for ante",
        "Grey Wolves",
        "Wicker Manikin",
        "at Death's Door",
        "Deathspeaker",
        "four Cores",
        "Muck Lampreys",
        "Grapple Shot",
    ];

    function setRandom() {
        discord.setActivityStatus(activities[Math.floor(Math.random() * activities.length)]);
    };

    setRandom();

    setInterval(() => {
        setRandom();
    }, 600_000); // 10 minute interval
}

export function devLog(log) {
    if (process.env.DEV_LOG) console.log(log);
}

export function startCase(input) {
    if (!input) return '';
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

export function formatUSD(amount) {
    return "$" + amount.toFixed(2).replace(/\.00$/, '');
}

export function getHelpMessage(serverId) {
    return '**Sorcery Card Lookup**\n' +
    'Place a full, partial, or misspelled card name within double brackets, e.g. **{{ruby core}}** to get the card\'s stats and a thumbnail image. Text casing and extra whitespace does not matter. The default card returned is its first printing (Alpha).\n\n' +

    'The following  commands can also be placed within the brackets *before* the card name:\n\n' +

    '**!** - to get a larger image, ex: **{{!death dealer}}**\n' +
    '**?** - to get official FAQ rulings on the card, from *curiosa.io*, ex: **{{?enchantress}}**\n' +
    (!blockPriceInfo.includes(serverId) ? '**$** - to get the *tcgplayer.com* lowest listed price, if available, ex: **{{$gray wolves}}**\n\n' : '\n') +

    'You can also place a "set code" after a *pipe* character following the card name to specify which set you would like, as in **{{critical strike | abt}}**.\n\n' +

    'The available set codes are:\n\n' +

    '**ALP** - Alpha\n' +
    '**BET** - Beta\n' +
    '**APC** - Alpha Preconstructed Deck\n' +
    '**APP** - Alpha Pledge Pack\n' +
    '**ABT** - Alpha Box Topper\n' +
    '**BBT** - Beta Box Topper\n' +
    '**P22** - 2022 Promo\n' +
    '**P23** - 2023 Promo'
}