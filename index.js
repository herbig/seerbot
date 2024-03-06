import { getHelpMessage, noSuchCardEmbed, defaultEmbed, imageEmbed, notInSetEmbed, pricesEmbed, rulingsEmbed, CLOSE_QUERY, OPEN_QUERY } from './embeds.js';
import { DiscordBot, randomizeActivity } from './discord_bot.js';
import { QueryCode, QueryMatcher } from './query_matcher.js';
import { CardRulings } from './card_rulings.js';
import { Analytics } from './analytics.js';
import { FourCoresAPI } from 'fourcores';
import { chunkArray } from './util.js';
import dotenv from 'dotenv';
dotenv.config();

const queryMatcher = new QueryMatcher('card_list.txt');
const discord = new DiscordBot(process.env.BOT_TOKEN);
const analytics = new Analytics();
const cardRulings = new CardRulings(analytics);
const api = new FourCoresAPI();

discord.onReady(() => {
    randomizeActivity(discord);
});

discord.onNewMessage(msg => {

    // if it's a bot message, don't do anything
    if (msg.author.bot) return;

    // detect ((help)) query and respond with the help message
    // this will ignore other card queries and only respond with help
    if (msg.content.replace(/\s+/g, '').toLowerCase().includes(`${OPEN_QUERY}help${CLOSE_QUERY}`)) {
        msg.reply(getHelpMessage(msg.guild.id));
        analytics.logHelp();
        return;
    }

    let bracketWarn = false;

    const embedPromises = queryMatcher.getMatches(msg).map(async match => {

        analytics.logQuery(match);

        // TODO can remove this eventually
        if (match.brackets) bracketWarn = true;

        if (match.cardName === undefined) {
            // the query didn't match an existing card name
            return noSuchCardEmbed(match);
        } else {

            const cards = await api.getCards(match.cardName, match.setCode);

            if (!cards) {
                // the card name has no printing in the given set code
                // TODO also given for general API errors, handle that separately
                return notInSetEmbed(match);
            } else {
                // card list data was retrieved successfully
               
                // unless we're displaying prices, we only need the first card in
                // the list.  This will either be the single card requested,
                // in the case of a specific set code lookup, or the first one
                // in the database, which is the first printing of the card
                switch(match.queryCode) {
                    case QueryCode.RULINGS:
                        return rulingsEmbed(match, cards[0], cardRulings);
                    case QueryCode.PRICE:
                        return pricesEmbed(match, cards); // provide the whole list
                    case QueryCode.IMAGE:
                        return imageEmbed(match, cards[0]);
                    default:
                        return defaultEmbed(match, cards[0]);
                }
            }
        }
    });

    if (bracketWarn) {
        msg.reply('Hey! Please switch to using (()), the {{}} brackets will eventually be removed for queries.  Use ((help)) to see the full set of options.');
    }

    // if the only query was empty (()), this would be 0
    if (embedPromises.length > 0) {
        // Discord only allows 10 embeds per message, 
        // so break responses into chunks
        const chunked = chunkArray(embedPromises, 10);
        for (const chunck of chunked) {
            // wait for all promises to resolve then send embeds
            Promise.all(chunck).then(embeds => {
                msg.channel.send({ embeds: embeds });
            });
        }
    }
});