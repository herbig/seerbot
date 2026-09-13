import { LRUCache } from 'lru-cache';

/**
 * Handles REST requests to the fourcores.gg API.
 */
export class FourCoresAPI {
    constructor(analytics) {
        this.API = 'https://fourcores.gg/api';
        // Identifies seerbot in the API's request logs, distinct from browser/other traffic.
        this.userAgent = 'seerbot/1.3.0 (+https://fourcores.gg)';
        // The API rejects any request without a valid key. seerbot has its own,
        // separate from the web app's, so either can be rotated or revoked
        // without taking the other down. Unlike the web app's key — which ships
        // in a public bundle and is therefore not a secret — this one only ever
        // lives in the bot's environment.
        this.apiKey = process.env.FOURCORES_API_KEY;
        if (!this.apiKey) {
            // Every request 401s without it, which otherwise just looks like the
            // API being down.
            analytics.logError('API key missing', new Error('FOURCORES_API_KEY is not set'));
        }
        this.cache = new LRUCache({
            max: 100,
            // 3 hour cache time, since price could change
            ttl: 1000 * 60 * 180,
        });
        this.analytics = analytics;
        // Each card's current official rules text and keywords, by name — see
        // getAllCards. Empty until the catalog has loaded.
        this.official = new Map();
    }

    async getMetadata() {
        return await this.request(`${this.API}/metadata`)
    }

    /**
     * The whole catalog: one entry per card name, its printings underneath.
     *
     * Reads /v2/cards rather than /cards because only v2 carries the card's
     * *current* official wording (errata included) — v1's rulesText is what
     * was printed on each card. The official text and keywords are kept by
     * name so getCards can lay them over the per-printing rows it returns.
     * Fetched once at startup and never refreshed, like the name index built
     * from it: both change only on a data reseed, after which the bot is
     * restarted anyway.
     */
    async getAllCards() {
        const catalog = await this.request(`${this.API}/v2/cards`);
        for (const card of catalog ?? []) {
            this.official.set(card.name, { rulesText: card.rulesText, keywords: card.keywords ?? [] });
        }
        return catalog;
    }

    /**
     * The printings of one card, optionally in one set and with prices — the
     * v1 shape the embeds render. `rulesText` on each is the card's current
     * official wording; what that printing actually printed is kept as
     * `printedRulesText`.
     */
    async getCards(cardName, setCode, prices) {
        const set = setCode === undefined ? '' : `&setCodes=${setCode.toLowerCase()}`;
        const includePrices = prices === undefined ? '' : `&prices=${prices}`;
        const url = `${this.API}/cards?name=${cardName}${set}${includePrices}`;
        const cards = await this.request(url);
        if (!cards) return cards;
        return cards.map(card => {
            const official = this.official.get(card.name);
            return {
                ...card,
                printedRulesText: card.rulesText,
                rulesText: official?.rulesText ?? card.rulesText,
                keywords: official?.keywords ?? [],
            };
        });
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
            const response = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {})
                }
            });

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
