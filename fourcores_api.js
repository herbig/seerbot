import { LRUCache } from 'lru-cache';
import { log } from './util.js';

/**
 * Handles REST requests to the fourcores.xyz API.
 */
export class FourCoresAPI {

    #API = 'https://fourcores.xyz/api';

    #cache = new LRUCache({
        max: 100,
        // 3 hour cache time, since price could change
        ttl: 1000 * 60 * 180,
    });

    async getCards(cardName, setCode) {

        const set = setCode === undefined ? '' : `&setCodes=${setCode.toLowerCase()}`;
        const url = `${this.#API}/cards?name=${encodeURIComponent(cardName)}${set}`;

        if (this.#cache.has(url)) {
            log('Returning cached cards: ' + cardName);
            return this.#cache.get(url);
        }

        log(url);

        try {
            const response = await fetch(url);

            if (!response.ok) return undefined;

            const cards = await response.json();

            if (cards && cards.length !== 0) {
                this.#cache.set(url, cards);
                return cards;
            } else {
                return null;
            }
        } catch (error) {
            return undefined;
        }
    }
}