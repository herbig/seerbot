import Fuse from "fuse.js";

/**
 * A fuzzy search implementation, which allows users to have 
 * minor misspellings and still get a result.
 */
export class FuzzySearch {

    fuse;

    constructor(searchList) { 
        this.fuse = new Fuse(searchList, { threshold: 0.3 });
    }

    search(searchPattern) {
        const result = this.fuse.search(searchPattern);
        return result.length > 0 ? result[0].item : undefined;
    }
}