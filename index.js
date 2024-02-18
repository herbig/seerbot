import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { cardSlug, loadCards, randomizeActivity } from './util.js'
import { FuzzySearch } from './fuzzysearch.js';
import dotenv from 'dotenv';
import { Rulings } from './rulings.js';
dotenv.config();

const fuzzySearch = new FuzzySearch(await loadCards());
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
                query = query.substring(1, query.length);
                queryCode = '?';
            }

            const cardMatch = fuzzySearch.search(query);
            const embed = new EmbedBuilder();
    
            if (cardMatch !== undefined) {

                const slug = cardSlug(cardMatch);
                embed.setTitle(`Rulings for ${cardMatch}`)
                    .setURL(process.env.CURIOSA_URL + slug);

                if (queryCode === '?') {
                    // if the FAQ scraping breaks, tell them
                    // to give me a heads up 
                    if (!rulings.rulingsInitialized()) {
                        embed.setDescription('Oops, something\'s up with rulings. Please ping @herbig to fix it.')
                            .setColor('#3F4248');
                    } else {

                        const faqs = rulings.getRulings(slug);
                        let description = '';

                        if (faqs === undefined || faqs.length === 0) {
                            description = `No rulings for ${cardMatch}.`;
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
                            .setColor('#674071');
                    }
                } else {
                    embed.setTitle(cardMatch)
                        .setDescription(process.env.CURIOSA_URL + slug)
                        .setImage(process.env.IMG_URL + slug + '.png')
                        .setColor('#674071');
                }
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