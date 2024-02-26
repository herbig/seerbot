import { QuickDB } from "quick.db";

export class LocalStorage {

    #keyServerInfo = 'serverInfo';

    #db = new QuickDB();

    constructor() {
        //
    }

    setSupportsPricing(supportsPricing) {
        this.#db.set(this.#keyServerInfo, { supportsPricing: supportsPricing });
    }

    async getSupportsPricing() {
        return await this.#db.get(`${this.#keyServerInfo}.supportsPricing`);
    }
}