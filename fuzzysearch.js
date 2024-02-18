import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Fuse from "fuse.js";
import path from 'path';

/**
 * A fuzzy search implementation, which allows users to have 
 * minor misspellings and still get a result.
 */
export class FuzzyCardSearch {

    fuse;

    constructor(searchList) {
        this.#initialize();
    }

    async #initialize() {
        const filePath = path.join(dirname(fileURLToPath(import.meta.url)), 'card_list.txt');
        const data = await readFile(filePath, { encoding: 'utf-8' });
        this.fuse = new Fuse(data.split(/\r?\n/), { threshold: 0.3 });
    }

    search(searchPattern) {
        const result = this.fuse.search(searchPattern);
        return result.length > 0 ? result[0].item : undefined;
    }
}