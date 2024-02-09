import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import removeAccents from 'remove-accents';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
	intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Remove accents on cards like Maelström and lowercase it, to be used as a
// reference key in the card map. This allows users to query for cards with
// or without using the accents.
function normalizeCardName(name) {
    return removeAccents(name.trim()).toLocaleLowerCase();
}

// map of the normalized card name to its data object
const cardMap = new Map();

// Initializes the card data.  This will only occur once at the start of the
// bot server, so we'll need to restart the app once a new set comes out and 
// the API is updated with it, but this should be fine for now.
async function fetchCards() {
    
    // if the api fails for whatever reason, we'll give it a few more tries
    let attempts = 0;
    const tries = 3;

    while (attempts < tries) {
        try {
            const response = await fetch(`${process.env.SORC_ENDPOINT}?apiKey=${process.env.SORC_KEY}`);

            if (!response.ok) {
                throw new Error(`API call failed with status ${response.status}.`);
            }

            const cards = await response.json();

            cards.forEach(card => {
                cardMap.set(normalizeCardName(card.name), card);
            });

            break;

        } catch (error) {
            attempts++;
            // wait a few seconds before the next attempt
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// fetch and cache the card data when the app starts
client.on(Events.ClientReady, async () => {
    await fetchCards();
});

// a list of colors for the embedded image message response
// TODO update keys depending on what the api response looks like
const elementColors = {
    Fire: '#843223',
    Water: '#295E76',
    Earth: '#3C3731',
    Air: '#4A4B50',
};
const elementless = '#191510';

client.on(Events.MessageCreate, msg => {

    // if it's us or another bot, don't do anything
    if (msg.author.bot) return;

    // match on the pattern {{SOMETEXT}}
    const match = msg.content.match(/\{\{(.*?)\}\}/);

    if (match) {

        const card = cardMap.get(normalizeCardName(match[1]));

        if (card !== undefined) {
            const embed = new EmbedBuilder()
                .setTitle(card.name)
                .setDescription(card.url) // TODO curiosa link
                .setImage(card.imageUrl)
                .setColor(elementColors[card.element] || elementless);
            msg.reply({ embeds: [embed] });
        } else {
            msg.reply(`I couldn\'t find \"${match[1]}\", did you mean to say \"Fellbog Frog Men\"?`);
        }
    }
});

client.login(process.env.BOT_TOKEN);