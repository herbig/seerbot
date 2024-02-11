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
    const matches = msg.content.match(/\{\{(.*?)\}\}/g);

    if (matches) {

        let embeds = new Array();

        for (let i = 0; i < matches.length; i++) {
            const normalized = normalizeCardName(matches[i]);

            // if the query is '{{}}' don't respond to it
            if (normalized === '') continue;
    
            const card = cardMap.get(normalized);
    
            const embed = new EmbedBuilder();
    
            if (card !== undefined) {
                embed.setTitle(card)
                    .setDescription(process.env.CURIOSA_URL + normalized)
                    .setImage(process.env.IMG_URL + normalized + '.png')
                    .setColor('#674071');
            } else {
                embed.setDescription(`No card found for \"${matches[i]
                    .replace('{{', '').replace('}}', '')}\"`)
                    .setColor('#3F4248');
            }

            embeds.push(embed);
        } 

        if (embeds.length > 0)
            msg.channel.send({ embeds: embeds });
    }
});

client.login(process.env.BOT_TOKEN);