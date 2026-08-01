import { getQueryHelpMessage } from './embeds.js';
import { commandHandler, COMMANDS } from './slash_commands.js';
import { isHelpQuery, matchEmbed } from './query_embeds.js';
import { QueryMatcher } from './query_matcher.js';
import { FuzzyCardSearch } from './fuzzy_search.js';
import { DiscordBot } from './discord_bot.js';
import { Analytics } from './analytics.js';
import { FourCoresAPI } from './four_cores_api.js';
import { chunkArray } from './util.js';
import dotenv from 'dotenv';
dotenv.config();

const analytics = new Analytics();
const api = new FourCoresAPI(analytics);
const allCards = await api.getAllCards()
const fuzzySearch = new FuzzyCardSearch(allCards.map(card => card.name));
const queryMatcher = new QueryMatcher(fuzzySearch);
const discord = new DiscordBot(analytics, process.env.BOT_TOKEN, process.env.BOT_CLIENT_ID, COMMANDS, commandHandler(fuzzySearch, queryMatcher, api, analytics));

discord.onNewMessage(async msg => {

    // if it's a bot message, don't do anything
    if (msg.author.bot) return;

    // Unless the app has the Message Content intent, Discord only fills in
    // msg.content for messages that @mention it.  Everything else arrives
    // with empty content and simply produces no matches below, and is left
    // to the "Card Lookup" message context menu command instead.

    // detect ((help)) query and respond with the help message
    // this will ignore other card queries and only respond with help
    if (isHelpQuery(msg.content)) {
        msg.reply(await getQueryHelpMessage(api));
        analytics.logHelp();
        return;
    }

    const embedPromises = queryMatcher.getMatches(msg.content).map(match => {
        analytics.logQuery(match);
        return matchEmbed(match, api);
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