import { CLOSE_QUERY, OPEN_QUERY, defaultEmbed, imageEmbed, noSuchCardEmbed, noSuchSetEmbed, notInSetEmbed, pricesEmbed, rulingsEmbed } from './embeds.js';
import { QueryCode } from './query_matcher.js';

/**
 * Detects a ((help)) query, which is answered on its own and ignores any
 * other card queries in the same text.
 *
 * @param {string} text the full text to check
 * @returns true if the text contains a ((help)) query
 */
export function isHelpQuery(text) {
    if (!text) return false;
    return text.replace(/\s+/g, '').toLowerCase().includes(`${OPEN_QUERY}help${CLOSE_QUERY}`);
}

/**
 * Resolves a single match from the QueryMatcher into the embed that answers it.
 *
 * @param {object} match a match in the form { queryCode, query, cardName, setCode }
 * @param {FourCoresAPI} api the Four Cores API
 * @returns the embed to respond with
 */
export async function matchEmbed(match, api) {

    if (match.cardName === undefined) {
        // the query didn't match an existing card name
        return noSuchCardEmbed(match.query);
    }

    const cards = await api.getCards(match.cardName, match.setCode, match.queryCode === QueryCode.PRICE);

    if (cards === undefined) {
        // the set code is invalid, (TODO or the API had an error)
        return noSuchSetEmbed(match.setCode);
    } else if (cards === null) {
        // the card name has no printing in the given (valid) set code
        return notInSetEmbed(match.cardName, match.setCode);
    }

    // card list data was retrieved successfully

    // unless we're displaying prices, we only need the first card in
    // the list.  This will either be the single card requested,
    // in the case of a specific set code lookup, or the first one
    // in the database, which is the first printing of the card
    switch (match.queryCode) {
        case QueryCode.RULINGS:
            return await rulingsEmbed(cards[0], api);
        case QueryCode.PRICE:
            return pricesEmbed(cards); // provide the whole list
        case QueryCode.IMAGE:
            return imageEmbed(cards[0]);
        default:
            return defaultEmbed(cards[0]);
    }
}
