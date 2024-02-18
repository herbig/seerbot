import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { cardSlug, randomizeActivity } from './util.js'
import { FuzzyCardSearch } from './fuzzysearch.js';
import { Rulings } from './rulings.js';
import dotenv from 'dotenv';
dotenv.config();

// the left bar color of the Discord embed
const colorSuccess = '#674071';
const colorFail = '#3F4248';

const fuzzySearch = new FuzzyCardSearch();
const rulings = new Rulings();

const client = new Client({
	intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on(Events.ClientReady, async () => {
    randomizeActivity(client);
});

client.on(Events.MessageCreate, msg => {

    // if it's a bot, don't do anything
    if (msg.author.bot) return;

    // match on the pattern {{SOMETEXT}}
    const matches = msg.content.match(/\{\{(.*?)\}\}/g);

    if (matches) {

        let embeds = new Array();

        matches.forEach((match) => {

            let query = match.replace('{{', '').replace('}}', '').trim();
            let queryCode = '';

            if (query === '') {
                // if query is '{{}}' don't respond to it
                return;
            } else if (query.startsWith('?')) {
                query = query.substring(1, query.length).trim();
                queryCode = '?';
            }

            const cardMatch = fuzzySearch.search(query);
            const embed = new EmbedBuilder();
    
            if (cardMatch !== undefined) {

                const slug = cardSlug(cardMatch);

                embed.setTitle(`Rulings for ${cardMatch}`)
                    .setURL(process.env.CURIOSA_URL + slug);

                if (queryCode === '?') {
                    // if the FAQ scraping breaks, tell them to give me a heads up 
                    if (!rulings.isInitialized()) {
                        embed.setDescription('Oops, something\'s up with rulings. Please ping @herbig to fix it.')
                            .setColor(colorFail);
                    } else {

                        const faqs = rulings.getRulings(slug);
                        let description = '';

                        if (faqs === undefined || faqs.length === 0) {
                            description = `No rulings available for ${cardMatch}.`;
                        } else {
                            for (let i = 0; i < faqs.length; i++) {
                                if (i % 2 === 0) {
                                    description += '**' + faqs[i] + '**\n';
                                } else {
                                    description += faqs[i] + '\n\n';
                                }
                            }
                        }

                        embed.setDescription(description)
                            .setColor(colorSuccess);
                    }
                } else {
                    embed.setTitle(cardMatch)
                        .setDescription(process.env.CURIOSA_URL + slug)
                        .setImage(process.env.IMG_URL + slug + '.png')
                        .setColor(colorSuccess);
                }
            } else {
                embed.setDescription(`No card found for \"${query}\"`)
                    .setColor(colorFail);
            }

            embeds.push(embed);
        });

        if (embeds.length > 0)
            msg.channel.send({ embeds: embeds });
    }
});

client.login(process.env.BOT_TOKEN);