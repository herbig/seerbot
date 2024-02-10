import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import removeAccents from 'remove-accents';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFile } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
	intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Performs the following modifications:
// 1. Remove accents, on cards like Maelström
// 2. Lowercase it
// 3. Change spaces and dashes to underscores
// 4. Remove non alpha characters like commas
//
// This allows users to query for cards with
// or without using the accents or apostrophes, commas, etc.
function normalizeCardName(name) {
    let formatted = removeAccents(name.trim()).toLocaleLowerCase();
    // Replace spaces or dashes with underscores
    formatted = formatted.replace(/[\s\-]+/g, '_');
    // Remove all non-alphabetic characters except for underscores
    formatted = formatted.replace(/[^a-zA-Z_]/g, '');
    return formatted;
}

// map of the normalized card name to its display name
const cardMap = new Map();

fs.readFile(path.join(dirname(fileURLToPath(import.meta.url)), 'card_list.txt'), 
    { encoding: 'utf-8' }, (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    const cardNames = data.split(/\r?\n/);

    // filter any empty lines
    const filteredCardNames = cardNames.filter(name => name.trim() !== '');

    filteredCardNames.forEach(name => {
        cardMap.set(normalizeCardName(name), name);
    });
});

client.on(Events.MessageCreate, msg => {

    // if it's us or another bot, don't do anything
    if (msg.author.bot) return;

    // match on the pattern {{SOMETEXT}}
    const match = msg.content.match(/\{\{(.*?)\}\}/);

    if (match) {

        const normalized = normalizeCardName(match[1]);
        const card = cardMap.get(normalized);

        if (card !== undefined) {
            const embed = new EmbedBuilder()
                .setTitle(card)
                .setDescription(process.env.CURIOSA_URL + normalized)
                .setImage(process.env.IMG_URL + normalized + '.png')
                .setColor('#2B2D31');
            msg.reply({ embeds: [embed] });
        } else {
            msg.reply(`I couldn\'t find \"${match[1]}\", did you mean to say \"Felbog Frog Men\"?`);
        }
    }
});

client.login(process.env.BOT_TOKEN);