import { CLOSE_QUERY, OPEN_QUERY } from './embeds.js';

export const QueryCode = Object.freeze({
    RULINGS: '?',
    IMAGE: '!',
    PRICE: '$',
});

const QUERY_CODES = Object.values(QueryCode);

/**
 * Matches card info queries of the form ((card name)), as well as handling
 * various query codes appended to the front or end of the intended card name.
 */
export class QueryMatcher {

    #fuzzySearch;

    constructor(fuzzySearch) {
        this.#fuzzySearch = fuzzySearch;
    }

    /**
     * Gets a list of query matches within the given Discord message.
     * Matches include a queryCode, representing a special character for 
     * a specific function (such as ? for card rulings), the query itself,
     * and the cardName matching the query (or undefined if there is no match).
     * 
     * @param {string} discordMsg the full text of the incoming Discord message
     * @returns An array of matches, in the form [{ queryCode, query, cardName }]
     */
    getMatches(discordMsg) {

        // match on the pattern ((SOME TEXT))
        const matches = discordMsg.content.match(/\(\((.*?)\)\)/g);

        const cardQueries = [];
    
        if (matches) {
            matches.forEach((match) => {
                let query = match
                    .replace(OPEN_QUERY, '')
                    .replace(CLOSE_QUERY, '')
                    .trim();
                let queryCode = undefined;
                let setCode = undefined;

                if (query === '') {
                    // if query is (()) ignore it entirely
                    return;
                } else if (QUERY_CODES.includes(query.substring(0, 1))) {
                    // handle if the query starts with a query code
                    queryCode = query.substring(0, 1);
                    query = query.substring(1, query.length).trim();
                }

                if (query.includes('|') && query.indexOf('|') !== query.length - 1) {
                    // handle if the query contains the | along with a potential set code at the end
                    setCode = query.substring(query.indexOf('|') + 1, query.length).trim();
                    query = query.substring(0, query.indexOf('|')).trim();
                }

                const cardName = this.#fuzzySearch.search(query);
                cardQueries.push({ queryCode: queryCode, query: query, cardName: cardName, setCode: setCode })
            });
        }

        // dedupe queries so there's only one response for the 
        // same card / code multiple times in the message
        const deduped = Array.from(new Set(cardQueries.map(obj => JSON.stringify(obj)))).map(str => JSON.parse(str));
    
        return deduped;
    }
}