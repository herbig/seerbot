import { cardSlug, randomizeActivity, colorSuccess, colorFail } from './util.js'
import { QueryCode, QueryMatcher } from './querymatcher.js';
import { CardRulings } from './cardrulings.js';
import { DiscordBot } from './discordbot.js';
import { EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const queryMatcher = new QueryMatcher();
const cardRulings = new CardRulings();
const discord = new DiscordBot();

discord.onReady(async () => {
    randomizeActivity(discord);
});

discord.onNewMessage(msg => {

    // if it's a bot message, don't do anything
    if (msg.author.bot) return;

    const embeds = [];

    queryMatcher.getMatches(msg).forEach(match => {

        var embed;

        if (match.cardName === undefined) {
            embed = new EmbedBuilder()
                .setDescription(`No card found for \"${match.query}\"`)
                .setColor(colorFail);
        } else {
            if (match.queryCode === QueryCode.RULINGS) {
                embed = cardRulings.getEmbed(match.cardName);
            } else {
                const slug = cardSlug(match.cardName);
                embed = new EmbedBuilder()
                    .setTitle(match.cardName)
                    .setDescription(process.env.CURIOSA_URL + slug)
                    .setImage(process.env.IMG_URL + slug + '.png')
                    .setColor(colorSuccess);
            }
        }

        embeds.push(embed);
    });

    if (embeds.length > 0)
        msg.channel.send({ embeds: embeds });
});