import { EmbedBuilder } from 'discord.js';
import { curiosaSlug } from './util.js';

export const OPEN_QUERY = '((';
export const CLOSE_QUERY = '))';

export function generalErrorEmbed() {
    return new EmbedBuilder()
        .setDescription('Oops, something weird happened, please try again.')
        .setColor(Color.FAIL);
}

export function noSuchCardEmbed(query) {
    return new EmbedBuilder()
        .setDescription(`No card found for \"${query}\".`)
        .setColor(Color.FAIL);
}

export function noSuchSetEmbed(setCode) {
    return new EmbedBuilder()
        .setDescription(`\"${setCode}\" is not a valid set code.`)
        .setColor(Color.FAIL);
}

export function notInSetEmbed(cardName, setCode) {
    return new EmbedBuilder()
        .setDescription(`${cardName} not found in \"${SetName[setCode.toUpperCase()]}\".`)
        .setColor(Color.FAIL);
}

export function rulingsEmbed(card, cardRulings) {
    const slug = curiosaSlug(card.name);
    const embed = new EmbedBuilder()
        .setTitle(`Rulings for ${card.name}`)
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
            description = `No rulings available for ${card.name}.`;
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

export function pricesEmbed(cards) {

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
        .setTitle(`${firstCard.name} Prices`)
        .setThumbnail(imgURL(firstCard));

    if (description === '') {
        return embed
            .setDescription(`No price info for ${firstCard.name}.`)
            .setColor(Color.FAIL);
    } else {
        return embed
            .setDescription('*TCGPlayer.com — Lowest Listing Price*\n\n' + description)
            .setColor(accentColor(firstCard.elements));
    }
}

export function imageEmbed(card) {
    return new EmbedBuilder()
        .setURL(CURIOSA_CARD_URL + curiosaSlug(card.name))
        .setColor(accentColor(card.elements))
        .setTitle(card.name)
        .setImage(imgURL(card));
}

export function defaultEmbed(card) {
    const title = card.name + '  ' + 
        costEmoji(card.manaCost) + 
        thresholdText(card.threshold);

    // subtypes here is only displaying if there is a single subtype.
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
        .setURL(CURIOSA_CARD_URL + curiosaSlug(card.name))
        .setColor(accentColor(card.elements))
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(imgURL(card));
}

export async function getQueryHelpMessage(api) {

    const metadata = await api.getMetadata();
    const sets = metadata.sets;

    const setsList = Object.values(sets)
        .map(set => `**${set.setCode}** — ${set.displayName}`)
        .join('\n');

    return '‎\n' + // empty space to create a line break that won't be trimmed by Discord
        '**SeerBot Sorcery Card Lookup**\n\n' +
        `Place a full, partial, or misspelled card name within double parenthesis, e.g. **${OPEN_QUERY}philosopher${CLOSE_QUERY}** to get the card's stats and a thumbnail image. Text casing or whitespace do not matter. The default card returned is its first printing (Alpha in most cases).\n\n` +

        'The following commands can also be placed within the parenthesis *before* the card name:\n\n' +

        `**!** — for a larger image, ex: **${OPEN_QUERY}!death dealer${CLOSE_QUERY}**\n` +
        `**?** — for official FAQ rulings on the card, from *[curiosa.io](<https://curiosa.io/faqs>)*, ex: **${OPEN_QUERY}?enchantress${CLOSE_QUERY}**\n` +
        `**$** — to get the *[tcgplayer.com](<https://www.tcgplayer.com/categories/trading-and-collectible-card-games/sorcery-contested-realm/price-guides>)* lowest listed price, if available, ex: **${OPEN_QUERY}$ruby core${CLOSE_QUERY}**\n\n` +

        `You can also place a "set code" after a *pipe* character *after* the card name to specify which set you would like, as in **${OPEN_QUERY}critical strike | abt${CLOSE_QUERY}**.\n\n` +

        'The current set codes are:\n\n' +

        setsList + '\n\n' +

        `Please ping <@${process.env.DEV_DISCORD_ID}> with any feedback or issues!`;
}

const CURIOSA_CARD_URL = 'https://curiosa.io/cards/';

function formatUSD(amount) {
    return "$" + amount.toFixed(2).replace(/\.00$/, '');
}

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
    if (elements.length === 0) return Color.COLORLESS;
    if (elements.length === 1) return Color[elements[0].toUpperCase()];
    return Color.GOLD;
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
    P24: '2024 Promo',
    D24: '2024 Dust Store Promo',
    SDK: 'Store Draft Kit',
    ALE: 'Arthurian Legends',
});

const ManaCostEmoji = [
    '<:m_00:1215045479126016111>',
    '<:m_01:1215045456120389713>',
    '<:m_02:1215045434691813417>',
    '<:m_03:1215045415247020042>',
    '<:m_04:1215045394296475660>',
    '<:m_05:1215045372951527516>',
    '<:m_06:1215045351548125204>',
    '<:m_07:1215045329645215855>',
    '<:m_08:1215045301702893568>',
    '<:m_09:1215045274100170772>',
    '<:m_X:1215045244853166080>',
];

function costEmoji(manaCost) {
    if (manaCost === '') return '';
    if (manaCost.toUpperCase() === 'X') return ManaCostEmoji[ManaCostEmoji.length - 1];
    return ManaCostEmoji[Number(manaCost)];
}

const ElementEmoji  = Object.freeze({
    EARTH: '<:t_earth:1215044585080881212>',
    FIRE: '<:t_fire:1215044601405120635>',
    WATER: '<:t_water:1215044618534785124>',
    AIR: '<:t_air:1215044557524439090>',
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
        .replace(/\(3\)/g, ManaCostEmoji[3])
        .replace(/\(4\)/g, ManaCostEmoji[4])
        .replace(/\(5\)/g, ManaCostEmoji[5])
        .replace(/\(6\)/g, ManaCostEmoji[6])
        .replace(/\(7\)/g, ManaCostEmoji[7])
        .replace(/\(8\)/g, ManaCostEmoji[8])
        .replace(/\(9\)/g, ManaCostEmoji[9])
        .replace(/\(X\)/g, ManaCostEmoji[10]);
}