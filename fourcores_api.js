import { LRUCache } from 'lru-cache';

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

    async getCard(cardName, setCode) {

        const set = setCode === undefined ? '' : `&setCodes=${setCode.toLowerCase()}`;
        const url = `${this.#API}/cards?name=${cardName}${set}`;

        if (this.#cache.has(url)) {
            console.log('Returning cached card: ' + cardName);
            return this.#cache.get(url);
        }

        console.log(url);

        try {
            const response = await fetch(url);

            if (!response.ok) return undefined;

            const data = await response.json();
            const card = data.length === 0 ? null : data[0];

            if (card) this.#cache.set(url, card);
            
            return card;
        } catch (error) {
            return undefined;
        }
    }
}