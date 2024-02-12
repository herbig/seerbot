import Fuse from "fuse.js";

/**
 * A fuzzy search implementation, which allows users to have 
 * minor misspellings and still get a result.
 */
export class FuzzySearch {

    fuse;

    constructor(searchList) { 
        // https://www.fusejs.io/api/options.html
        const opts = {
            includeScore: true,
            threshold: 0.3,
        };
        this.fuse = new Fuse(searchList, opts);
    }

    search(searchPattern) {
        const result = this.fuse.search(searchPattern);
        return result.length > 0 ? result[0].item : undefined;
    }
}