import { getQueryHelpMessage, noSuchSetEmbed, noSuchCardEmbed, defaultEmbed, imageEmbed, notInSetEmbed, pricesEmbed, rulingsEmbed, CLOSE_QUERY, OPEN_QUERY } from './embeds.js';
import { commandHandler, COMMANDS } from './slash_commands.js';
import { QueryCode, QueryMatcher } from './query_matcher.js';
import { FuzzyCardSearch } from './fuzzy_search.js';
import { CardRulings } from './card_rulings.js';
import { randomizeActivity } from './util.js';
import { DiscordBot } from './discord_bot.js';
import { Analytics } from './analytics.js';
import { FourCoresAPI } from 'fourcores';
import { chunkArray } from './util.js';
import dotenv from 'dotenv';
dotenv.config();

const fuzzySearch = new FuzzyCardSearch('card_list.txt');
const api = new FourCoresAPI();
const analytics = new Analytics();
const cardRulings = new CardRulings(analytics);
const discord = new DiscordBot(analytics, process.env.BOT_TOKEN, process.env.BOT_CLIENT_ID, COMMANDS, commandHandler(fuzzySearch, api, cardRulings, analytics));
const queryMatcher = new QueryMatcher(fuzzySearch);

discord.onReady(() => {
    randomizeActivity(discord);
});

// a map of server ids to their allowed SeerBot channel ids
// TODO this is a quick hack to support requested whitelisting,
// it would be great to have this admin configurable
const serverRestrictions = {
    // Team Covenant https://discord.gg/MfP4zqb6kR
    "727928658190401636": ["953350545597403226"],
};


discord.onNewMessage(msg => {

    // if it's a bot message, don't do anything
    if (msg.author.bot) return;

    // check for any requested channel restrictions
    if (serverRestrictions[msg.guild.id] !== null && !serverRestrictions[msg.guild.id].includes(msg.channel.id)) return;

    // detect ((help)) query and respond with the help message
    // this will ignore other card queries and only respond with help
    if (msg.content.replace(/\s+/g, '').toLowerCase().includes(`${OPEN_QUERY}help${CLOSE_QUERY}`)) {
        msg.reply(getQueryHelpMessage());
        analytics.logHelp();
        return;
    }

    const embedPromises = queryMatcher.getMatches(msg).map(async match => {

        analytics.logQuery(match);

        if (match.cardName === undefined) {
            // the query didn't match an existing card name
            return noSuchCardEmbed(match.query);
        } else {

            const cards = await api.getCards(match.cardName, match.setCode, match.queryCode === QueryCode.PRICE);

            if (cards === undefined) {
                // the set code is invalid, (TODO or the API had an error)
                return noSuchSetEmbed(match.setCode);
            } else if (cards === null) {
                // the card name has no printing in the given (valid) set code
                return notInSetEmbed(match.cardName, match.setCode);
            } else {
                // card list data was retrieved successfully
               
                // unless we're displaying prices, we only need the first card in
                // the list.  This will either be the single card requested,
                // in the case of a specific set code lookup, or the first one
                // in the database, which is the first printing of the card
                switch(match.queryCode) {
                    case QueryCode.RULINGS:
                        return rulingsEmbed(cards[0], cardRulings);
                    case QueryCode.PRICE:
                        return pricesEmbed(cards); // provide the whole list
                    case QueryCode.IMAGE:
                        return imageEmbed(cards[0]);
                    default:
                        return defaultEmbed(cards[0]);
                }
            }
        }
    });

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