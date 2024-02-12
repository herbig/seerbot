import removeAccents from 'remove-accents';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

/**
 * Normalize the card name to the same identifier that curiosa.io uses.
 */
export function cardSlug(name) {
    return removeAccents(name)
        .toLowerCase()
        .replace(/[\s\-]+/g, '_') // Replace spaces or dashes with underscores
        .replace(/[^a-zA-Z_]/g, ''); // Remove non-alphabetic characters (except for underscores)
}

/**
 * Loads cards from a flat text file to an array.
 */
export async function loadCards() {
    const filePath = path.join(dirname(fileURLToPath(import.meta.url)), 'card_list.txt');
    const data = await readFile(filePath, { encoding: 'utf-8' });
    return data.split(/\r?\n/);
}