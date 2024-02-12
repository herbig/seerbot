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

/**
 * Sets an interval to randomly update the Discord activity status of the bot.
 */
export function randomizeActivity(client) {

    const activities = [
        "for ante",
        "Grey Wolves",
        "Wicker Manikin",
        "at Death's Door",
        "Deathspeaker",
        "four Cores",
        "Muck Lampreys",
        "Grapple Shot",
    ];

    function setRandom() {
        client.user.setActivity(activities[Math.floor(Math.random() * activities.length)]);
    };

    setRandom();

    setInterval(() => {
        setRandom();
    }, 600_000); // 10 minute interval
}