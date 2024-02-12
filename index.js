import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { cardSlug, loadCards } from './util.js'
import { FuzzySearch } from './fuzzysearch.js';
import dotenv from 'dotenv';
dotenv.config();

const fuzzySearch = new FuzzySearch(await loadCards());

const client = new Client({
	intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on(Events.MessageCreate, msg => {

    // if it's a bot, don't do anything
    if (msg.author.bot) return;

    // match on the pattern {{SOMETEXT}}
    const matches = msg.content.match(/\{\{(.*?)\}\}/g);

    if (matches) {

        let embeds = new Array();

        matches.forEach((match) => {
            const query = match.replace('{{', '').replace('}}', '').trim();

            // if query is '{{}}' don't respond to it
            if (query === '') return;

            const cardMatch = fuzzySearch.search(query);
            const embed = new EmbedBuilder();
    
            if (cardMatch !== undefined) {
                const slug = cardSlug(cardMatch);
                embed.setTitle(cardMatch)
                    .setDescription(process.env.CURIOSA_URL + slug)
                    .setImage(process.env.IMG_URL + slug + '.png')
                    .setColor('#674071');
            } else {
                embed.setDescription(`No card found for \"${query}\"`)
                    .setColor('#3F4248');
            }

            embeds.push(embed);
        });

        if (embeds.length > 0)
            msg.channel.send({ embeds: embeds });
    }
});

client.login(process.env.BOT_TOKEN);