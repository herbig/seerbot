import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { normalizeCardName, loadCards } from './util.js'
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
	intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

let cardMap = new Map();

// load the card data when the app starts
client.on(Events.ClientReady, async () => {
    cardMap = await loadCards();
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