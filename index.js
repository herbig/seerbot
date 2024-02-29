import { getHelpMessage, defaultEmbed, imageEmbed, noMatchEmbed, pricesEmbed, rulingsEmbed } from './embeds.js';
import { DiscordBot, randomizeActivity } from './discord_bot.js';
import { QueryCode, QueryMatcher } from './query_matcher.js';
import { FourCoresAPI } from './fourcores_api.js';
import { CardRulings } from './card_rulings.js';
import dotenv from 'dotenv';
dotenv.config();

const queryMatcher = new QueryMatcher('card_list.txt');
const discord = new DiscordBot(process.env.BOT_TOKEN);
const cardRulings = new CardRulings();
const api = new FourCoresAPI();

discord.onReady(async () => {
    randomizeActivity(discord);
});

discord.onNewMessage(msg => {

    // if it's a bot message, don't do anything
    if (msg.author.bot) return;

    // detect {{help}} query and respond with the help message
    // this will ignore other card queries and only respond with help
    if (msg.content.replace(/\s+/g, '').toLowerCase().includes('{{help}}')) {
        msg.reply(getHelpMessage(msg.guild.id));
        return;
    }

    const embedPromises = queryMatcher.getMatches(msg).map(async match => {

        if (match.cardName === undefined) {
            // the query didn't match an existing card name
            return noMatchEmbed(match);
        } else {

            const cards = await api.getCards(match.cardName, match.setCode);

            if (!cards) {
                // the card name has no printing in the given set code
                // TODO also given for general API errors, handle that separately
                // TODO we could also give a different message if the card exists but the set code doesn't
                return noMatchEmbed(match);
            } else {

                // unless we're displaying prices, we only need the first card in
                // the list.  This will either be the single card requested,
                // in the case of a specific set code lookup, or the first one
                // in the database, which is the first printing of the card
                const card = cards[0];

                // card list data was retrieved successfully
                switch(match.queryCode) {
                    case QueryCode.RULINGS:
                        return rulingsEmbed(match, card, cardRulings);
                    case QueryCode.PRICE:
                        return pricesEmbed(match, cards); // provide the whole list
                    case QueryCode.IMAGE:
                        return imageEmbed(match, card);
                    default:
                        return defaultEmbed(match, card);
                }
            }
        }
    });

    // wait for all promises to resolve then send embeds
    Promise.all(embedPromises).then(embeds => {
        if (embeds.length > 0) msg.channel.send({ embeds: embeds });
    });
});