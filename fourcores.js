import { devLog } from "./util.js";

export class FourCoresAPI {

    #API = 'https://fourcores.xyz/api';

    async getCard(cardName, setCode) {

        const set = setCode === undefined ? '' : `&setCodes=${setCode}`;
        const url = `${this.#API}/cards?name=${cardName}${set}`;

        devLog(url);

        try {
            const response = await fetch(url);

            if (!response.ok) return undefined;

            const data = await response.json();
            return data.length === 0 ? null : data[0];
        } catch (error) {
            return undefined;
        }
    }
}