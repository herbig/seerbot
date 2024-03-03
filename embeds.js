import { Embed, EmbedBuilder } from 'discord.js';
import { cardSlug } from './util.js';

export const OPEN_QUERY = '((';
export const CLOSE_QUERY = '))';

export function noSuchCardEmbed(match) {
    return new EmbedBuilder()
        .setDescription(`No card found for \"${match.query}\".`)
        .setColor(Color.FAIL);
}

export function notInSetEmbed(match) {
    return new EmbedBuilder()
        .setDescription(`${match.cardName} not found in \"${match.setCode}\".`)
        .setColor(Color.FAIL);
}

/**
 * Gets the Discord embed response for a rulings query.
 * 
 * @param {string} cardName the full text name of the card
 * @returns {Embed} a Discord embed
 */
export function rulingsEmbed(match, card, cardRulings) {
    const slug = cardSlug(match.cardName);
    const embed = new EmbedBuilder()
        .setTitle(`Rulings for ${match.cardName}`)
        .setThumbnail(imgURL(card))
        .setURL(CURIOSA_CARD_URL + slug);

    // if the FAQ scraping breaks, tell them to give me a heads up 
    if (!cardRulings.isInitialized()) {
        embed.setDescription(`Oops, something\'s up with rulings. Please ping <@${process.env.DEV_DISCORD_ID}> to fix it.`)
            .setColor(Color.FAIL);
    } else {
        
        const faqs = cardRulings.getRulings(slug);
        let description = '';

        if (faqs === undefined || faqs.length === 0) {
            description = `No rulings available for ${match.cardName}.`;
        } else {
            for (let i = 0; i < faqs.length; i++) {
                if (i % 2 === 0) {
                    description += '**' + faqs[i] + '**\n';
                } else {
                    description += faqs[i] + '\n\n';
                }
            }
        }
        embed.setDescription(description)
            .setColor(accentColor(card.elements));
    }

    return embed;
}

export function pricesEmbed(match, cards) {

    var description = '';

    for (const card of cards) {

        var cardPrice = '';

        for (const finish of card.finishes) {
            if (finish.tcgPlayerId !== null) {
                const url = `https://www.tcgplayer.com/product/${finish.tcgPlayerId}`;
                const price = finish.lowPriceUSD === null ? 'None listed' : formatUSD(finish.lowPriceUSD);
                cardPrice = cardPrice + 
                    '**[' + startCase(finish.type) + `](${url})** — ` + price + '\n';
            }
        }
        
        if (cardPrice !== '') {
            cardPrice = `**${SetName[card.setCode]}**\n` + cardPrice + '\n';
        }

        description = description + cardPrice;
    }

    const firstCard = cards[0];

    const embed = new EmbedBuilder()
        .setTitle(`${match.cardName} Prices`)
        .setThumbnail(imgURL(firstCard));

    if (description === '') {
        return embed
            .setDescription(`No price info for ${match.cardName}.`)
            .setColor(Color.FAIL);
    } else {
        return embed
            .setDescription('*TCGPlayer.com — Lowest Listing Price*\n\n' + description)
            .setColor(accentColor(firstCard.elements));
    }
}

export function imageEmbed(match, card) {
    return new EmbedBuilder()
        .setURL(CURIOSA_CARD_URL + cardSlug(match.cardName))
        .setColor(accentColor(card.elements))
        .setTitle(match.cardName)
        .setImage(imgURL(card));
}

export function defaultEmbed(match, card) {
    const title = match.cardName + '  ' + 
        costEmoji(card.manaCost) + 
        thresholdText(card.threshold);

    // subtypes here is only displaying if there is a single one.
    // This only currently impacts Azuridge Caravan, which in the 
    // database has all available minion subtypes
    const description = 
        '**' + startCase(card.rarity) + ' — ' + startCase(card.category) + 
            (card.types.length > 0 ? ' — ' + card.types.map(s => startCase(s)).join(' ') : '') + 
            (card.subtypes.length === 1 ? ' — ' + startCase(card.subtypes[0]) : '') + '**\n' +
        (card.power ? 'Power ' + card.power + '\n' : '') +
        replaceManaSymbols(card.rulesText) +  '\n' +
        (card.flavorText !== '' ? '*' + card.flavorText + '*' : '');

    return new EmbedBuilder()
        .setURL(CURIOSA_CARD_URL + cardSlug(match.cardName))
        .setColor(accentColor(card.elements))
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(imgURL(card));
}

export function getHelpMessage(serverId) {
    return '‎\n' + // empty space to create a line break that won't be trimmed by Discord
    '**SeerBot Sorcery Card Lookup**\n\n' +
    `Place a full, partial, or misspelled card name within double parenthesis, e.g. **${OPEN_QUERY}philosopher${CLOSE_QUERY}** to get the card\'s stats and a thumbnail image. Text casing or whitespace do not matter. The default card returned is its first printing (Alpha in most cases).\n\n` +

    'The following  commands can also be placed within the parenthesis *before* the card name:\n\n' +

    `**!** — for a larger image, ex: **${OPEN_QUERY}!death dealer${CLOSE_QUERY}**\n` +
    `**?** — for official FAQ rulings on the card, from *[curiosa.io](<https://curiosa.io/faqs>)*, ex: **${OPEN_QUERY}?enchantress${CLOSE_QUERY}**\n` +
    (!blockPriceLookups.includes(serverId) ? `**$** — to get the *[tcgplayer.com](<https://www.tcgplayer.com/categories/trading-and-collectible-card-games/sorcery-contested-realm/price-guides>)* lowest listed price, if available, ex: **${OPEN_QUERY}$ruby core${CLOSE_QUERY}**\n\n` : '\n') +

    `You can also place a "set code" after a *pipe* character *after* the card name to specify which set you would like, as in **${OPEN_QUERY}critical strike | abt${CLOSE_QUERY}**.\n\n` +

    'The current set codes are:\n\n' +

    '**ALP** — Alpha\n' +
    '**BET** — Beta\n' +
    '**APC** — Alpha Preconstructed Deck\n' +
    '**APP** — Alpha Pledge Pack\n' +
    '**ABT** — Alpha Box Topper\n' +
    '**BBT** — Beta Box Topper\n' +
    '**P22** — 2022 Promo\n' +
    '**P23** — 2023 Promo\n\n' +

    `Please ping <@${process.env.DEV_DISCORD_ID}> with any feedback or issues!`
}

const CURIOSA_CARD_URL = 'https://curiosa.io/cards/';

function formatUSD(amount) {
    return "$" + amount.toFixed(2).replace(/\.00$/, '');
}

/** List of Discord server ids to not allow price lookups on. */
const blockPriceLookups = [
    '769359301466652693', // Official Sorcery Discord
];

function imgURL(card) {
    return process.env.IMG_URL_BASE + card.id + (card.category.toUpperCase() === 'SITE' ? '_hor' : '') + '.png';
}

function startCase(input) {
    if (!input) return '';
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

const Color  = Object.freeze({
    EARTH: '#a99e7d',
    AIR: '#aab4d7',
    FIRE: '#f25c24',
    WATER: '#65bfdc',
    COLORLESS: '#221B17',
    GOLD: '#CCAC47',

    FAIL: '#3F4248',
});

function accentColor(elements) {
    if (elements.length === 0) {
        return Color.COLORLESS;
    } else if (elements.length === 1) {
        return Color[elements[0].toUpperCase()];
    } else {
        return Color.GOLD;
    }
}

const SetName  = Object.freeze({
    APP: 'Alpha Pledge Pack',
    APC: 'Alpha Precon',
    ABT: 'Alpha Box Topper',
    P22: '2022 Promo',
    ALP: 'Alpha',
    BET: 'Beta',
    BBT: 'Beta Box Topper',
    P23: '2023 Promo',
});

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

function costEmoji(manaCost) {
    if (manaCost === '') return '';
    if (manaCost.toUpperCase() == 'X') return ManaCostEmoji[ManaCostEmoji.length - 1];
    return ManaCostEmoji[Number(manaCost)];
}

const ElementEmoji  = Object.freeze({
    EARTH: '<:t_earth:1210681878198353931>',
    FIRE: '<:t_fire:1210681555077435393>',
    WATER: '<:t_water:1210681879661903933>',
    AIR: '<:t_air:1210681551650558032>',
});

function thresholdText(threshold) {
    return ElementEmoji.EARTH.repeat(threshold.earth) + 
        ElementEmoji.FIRE.repeat(threshold.fire) + 
        ElementEmoji.WATER.repeat(threshold.water) +
        ElementEmoji.AIR.repeat(threshold.air);
}

function replaceManaSymbols(inputString) {
    return inputString
        .replace(/\(F\)/g, ElementEmoji.FIRE)
        .replace(/\(E\)/g, ElementEmoji.EARTH)
        .replace(/\(A\)/g, ElementEmoji.AIR)
        .replace(/\(W\)/g, ElementEmoji.WATER)
        .replace(/\(0\)/g, ManaCostEmoji[0])
        .replace(/\(1\)/g, ManaCostEmoji[1])
        .replace(/\(2\)/g, ManaCostEmoji[2])
        .replace(/\(3\)/g, ManaCostEmoji[3]);
}