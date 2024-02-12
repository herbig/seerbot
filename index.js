import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { normalizeCardName, loadCards } from './util.js'
import { FuzzySearch } from './fuzzysearch.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
	intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

const fuzzySearch = new FuzzySearch(await loadCards());

client.on(Events.MessageCreate, msg => {

    // if it's a bot, don't do anything
    if (msg.author.bot) return;

    // match on the pattern {{SOMETEXT}}
    const matches = msg.content.match(/\{\{(.*?)\}\}/g);

    if (matches) {

        let embeds = new Array();

        for (let i = 0; i < matches.length; i++) {

            const query = matches[i].replace('{{', '').replace('}}', '').trim();

            // if query is '{{}}' don't respond to it
            if (query === '') continue;

            const match = fuzzySearch.search(query);
            const embed = new EmbedBuilder();
    
            if (match !== undefined) {
                const normalized = normalizeCardName(match);
                embed.setTitle(match)
                    .setDescription(process.env.CURIOSA_URL + normalized)
                    .setImage(process.env.IMG_URL + normalized + '.png')
                    .setColor('#674071');
            } else {
                embed.setDescription(`No card found for \"${query}\"`)
                    .setColor('#3F4248');
            }

            embeds.push(embed);
        } 

        if (embeds.length > 0)
            msg.channel.send({ embeds: embeds });
    }
});

client.login(process.env.BOT_TOKEN);