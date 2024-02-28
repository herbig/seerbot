import { getHelpMessage, blockPriceLookups, defaultEmbed, imageEmbed, noMatchEmbed, priceEmbed, rulingsEmbed } from './embeds.js';
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
            return noMatchEmbed(match);
        } else {
            if (match.queryCode === QueryCode.RULINGS) {
                return rulingsEmbed(match.cardName, cardRulings);
            } else {

                const card = await api.getCard(match.cardName, match.setCode);

                if (!card) {
                    return noMatchEmbed(match);
                } else if (match.queryCode === QueryCode.PRICE && !blockPriceLookups.includes(msg.guild.id)) {
                    return priceEmbed(match, card);
                } else if (match.queryCode === QueryCode.IMAGE) {
                    return imageEmbed(match, card);
                } else {
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