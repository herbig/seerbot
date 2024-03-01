import removeAccents from 'remove-accents';

/**
 * Normalize the card name to the same identifier that curiosa.io uses.
 */
export function cardSlug(name) {
    return removeAccents(name)       // remove accents, such as Ä
        .toLowerCase()               // lowercase it
        .replace(/[\s\-]+/g, '_')    // Replace spaces or dashes with underscores
        .replace(/[^a-zA-Z_]/g, ''); // Remove non-alphabetic characters (except for underscores)
}

export function log(message) {
    if (process.env.NODE_ENV !== 'dev') return;
    console.log(message);
}