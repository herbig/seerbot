import { SetName, cardSlug, Color, thresholdText, startCase, costEmoji, replaceManaSymbols, formatUSD, accentColor } from './util.js';
import { Embed, EmbedBuilder } from 'discord.js';

const CURIOSA_CARD_URL = 'https://curiosa.io/cards/';

/** List of Discord server ids to not allow price lookups on. */
export const blockPriceLookups = [
    '769359301466652693', // Official Sorcery Discord
];

function imgURL(card) {
    return process.env.IMG_URL_BASE + card.id + (card.category.toUpperCase() === 'SITE' ? '_hor' : '') + '.png';
}

export function noMatchEmbed(match) {
    const set = match.setCode ? ` in \"${match.setCode}\"` : '';
    return new EmbedBuilder()
        .setDescription(`No card found for \"${match.query}\"${set}`)
        .setColor(Color.FAIL);
}

/**
 * Gets the Discord embed response for a rulings query.
 * 
 * @param {string} cardName the full text name of the card
 * @returns {Embed} a Discord embed
 */
export function rulingsEmbed(cardName, cardRulings) {
    const slug = cardSlug(cardName);
    const embed = new EmbedBuilder()
        .setTitle(`Rulings for ${cardName}`)
        // using slug based location, since we don't have card info here
        // TODO we could request the card to remove these images as well
        // as get the card's elements for the accent color
        .setThumbnail(`https://sorcery-images.s3.amazonaws.com/${slug}.png`)
        .setURL(CURIOSA_CARD_URL + slug);

    // if the FAQ scraping breaks, tell them to give me a heads up 
    if (!cardRulings.isInitialized()) {
        embed.setDescription('Oops, something\'s up with rulings. Please ping @herbig to fix it.')
            .setColor(Color.FAIL);
    } else {
        
        const faqs = cardRulings.getRulings(slug);
        let description = '';

        if (faqs === undefined || faqs.length === 0) {
            description = `No rulings available for ${cardName}.`;
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
            .setColor(Color.SUCCESS);
    }

    return embed;
}

export function priceEmbed(match, card) {
    const title = `${match.cardName} - ${SetName[card.setCode]}`;
    var description = '';

    for (const finish of card.finishes) {
        if (finish.tcgPlayerId !== null) {
            const url = `https://www.tcgplayer.com/product/${finish.tcgPlayerId}`;
            const price = finish.lowPriceUSD === null ? 'None listed' : formatUSD(finish.lowPriceUSD);
            description = description + 
                '**[' + startCase(finish.type) + `](${url})**\n` + price + '\n';
        }
    }

    const slug = cardSlug(match.cardName);

    if (description === '') {
        return new EmbedBuilder()
            .setTitle(title)
            .setURL(CURIOSA_CARD_URL + slug)
            .setThumbnail(imgURL(card))
            .setDescription(`No price info for ${match.cardName}.`)
            .setColor(Color.FAIL);
    } else {
        return new EmbedBuilder()
            .setTitle(title)
            .setURL(CURIOSA_CARD_URL + slug)
            .setThumbnail(imgURL(card))
            .setDescription('*TCGPlayer.com - Lowest Listing Price*\n' + description)
            .setColor(accentColor(card.elements));
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
    'Place a full, partial, or misspelled card name within curly double brackets, e.g. **{{philosopher}}** to get the card\'s stats and a thumbnail image. Text casing or whitespace do not matter. The default card returned is its first printing (Alpha in most cases).\n\n' +

    'The following  commands can also be placed within the brackets *before* the card name:\n\n' +

    '**!** - for a larger image, ex: **{{!death dealer}}**\n' +
    '**?** - for official FAQ rulings on the card, from *[curiosa.io](<https://curiosa.io/faqs>)*, ex: **{{?enchantress}}**\n' +
    (!blockPriceLookups.includes(serverId) ? '**$** - to get the *[tcgplayer.com](<https://www.tcgplayer.com/categories/trading-and-collectible-card-games/sorcery-contested-realm/price-guides>)* lowest listed price, if available, ex: **{{$ruby core}}**\n\n' : '\n') +

    'You can also place a "set code" after a *pipe* character *after* the card name to specify which set you would like, as in **{{critical strike | abt}}**.\n\n' +

    'The current set codes are:\n\n' +

    '**ALP** - Alpha\n' +
    '**BET** - Beta\n' +
    '**APC** - Alpha Preconstructed Deck\n' +
    '**APP** - Alpha Pledge Pack\n' +
    '**ABT** - Alpha Box Topper\n' +
    '**BBT** - Beta Box Topper\n' +
    '**P22** - 2022 Promo\n' +
    '**P23** - 2023 Promo'
}