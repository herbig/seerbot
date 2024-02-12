import removeAccents from 'remove-accents';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

/**
 * Performs the following modifications:
 * 
 * 1. Remove accents, on cards like Maelström
 * 2. Lowercase it
 * 3. Change spaces and dashes to underscores
 * 4. Remove non alpha characters like commas
 * 
 * This allows users to query for cards with or without 
 * using the accents or apostrophes, commas, etc.
 */
export function normalizeCardName(name) {
    let formatted = removeAccents(name.trim()).toLocaleLowerCase();
    // Replace spaces or dashes with underscores
    formatted = formatted.replace(/[\s\-]+/g, '_');
    // Remove all non-alphabetic characters except for underscores
    formatted = formatted.replace(/[^a-zA-Z_]/g, '');
    return formatted;
}

/**
 * Loads cards from a flat text file to an array.
 */
export async function loadCards() {
    const filePath = path.join(
        dirname(fileURLToPath(import.meta.url)), 'card_list.txt');
    const data = await readFile(filePath, { encoding: 'utf-8' });
    return data.split(/\r?\n/);
}