import removeAccents from 'remove-accents';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFile } from 'fs/promises';
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
 * Loads the cards from the full list and maps them to their normalized name.
 */
export async function loadCards() {
    const cardMap = new Map();
    const filePath = path.join(
        dirname(fileURLToPath(import.meta.url)), 'card_list.txt');

    try {
        const data = await readFile(filePath, { encoding: 'utf-8' });
        const cardNames = data.split(/\r?\n/);
        cardNames.forEach(name => {
            cardMap.set(normalizeCardName(name), name);
        });
    } catch (err) {
        console.error('Error reading the file:', err);
    }

    return cardMap;
}