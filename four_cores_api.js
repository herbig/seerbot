import { LRUCache } from 'lru-cache';

/**
 * Handles REST requests to the fourcores.xyz API.
 */
export class FourCoresAPI {
    constructor(analytics) {
        this.API = 'https://fourcores.xyz/api';
        this.cache = new LRUCache({
            max: 100,
            // 3 hour cache time, since price could change
            ttl: 1000 * 60 * 180,
        });
        this.analytics = analytics;
    }

    async getMetadata() {
        return await this.request(`${this.API}/metadata`)
    }

    async getAllCards() {
        return await this.request(`${this.API}/cards`)
    }

    async getCards(cardName, setCode, prices) {
        const set = setCode === undefined ? '' : `&setCodes=${setCode.toLowerCase()}`;
        const includePrices = prices === undefined ? '' : `&prices=${prices}`;
        const url = `${this.API}/cards?name=${cardName}${set}${includePrices}`;
        return await this.request(url)
    }

    async getRulings(cardSlug) {
        const url = `${this.API}/rulings?cardSlug=${cardSlug}`;
        return await this.request(url)
    }

    async request(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(url);

            if (!response.ok) return undefined;

            const cards = await response.json();

            if (cards && cards.length !== 0) {
                this.cache.set(url, cards);
                return cards;
            } else {
                return null;
            }
        } catch (error) {
            this.analytics.logError('API error', error);
            return undefined;
        }
    }
}
