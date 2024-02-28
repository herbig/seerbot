import { CURIOSA_CARD_URL, SetName, cardSlug, Color, thresholdText, startCase, costEmoji, replaceManaSymbols, formatUSD, blockPriceLookups, getHelpMessage, accentColor } from './util.js'
import { DiscordBot, randomizeActivity } from './discordbot.js';
import { QueryCode, QueryMatcher } from './querymatcher.js';
import { CardRulings } from './cardrulings.js';
import { FourCoresAPI } from './fourcores.js';
import { EmbedBuilder } from 'discord.js';
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

    // detect {{help}} query and response with the help message
    if (msg.content.replace(/\s+/g, '').toLowerCase().includes('{{help}}')) {
        msg.reply(getHelpMessage(msg.guild.id));
        return;
    }

    const embedPromises = queryMatcher.getMatches(msg).map(async match => {
        if (match.cardName === undefined) {
            return new EmbedBuilder()
                .setDescription(`No card found for \"${match.query}\"`)
                .setColor(Color.FAIL);
        } else {
            if (match.queryCode === QueryCode.RULINGS) {
                return cardRulings.getEmbed(match.cardName);
            } else {
                const slug = cardSlug(match.cardName);
                const card = await api.getCard(match.cardName, match.setCode);

                if (!card) {
                    const set = match.setCode ? ` in \"${match.setCode}\"` : '';
                    return new EmbedBuilder()
                        .setDescription(`No card found for \"${match.query}\"${set}`)
                        .setColor(Color.FAIL);
                }

                const image = 
                    process.env.IMG_URL_BASE + 
                    card.id + (card.category.toUpperCase() === 'SITE' ? '_hor' : '') + '.png';

                if (match.queryCode === QueryCode.PRICE && !blockPriceLookups.includes(msg.guild.id)) {

                    const title = `${match.cardName} - ${SetName[card.setCode]}`;
                    var description = '';

                    for (const finish of card.finishes) {
                        if (finish.tcgPlayerId !== null) {
                            const url = `https://www.tcgplayer.com/product/${finish.tcgPlayerId}`;
                            const price = finish.lowPriceUSD === null ? 'None listed' : formatUSD(finish.lowPriceUSD);
                            description = description + 
                                '**[' + startCase(finish.type) + `](${url})**\n` + price + '\n';
                        }
                    }

                    if (description === '') {
                        return new EmbedBuilder()
                            .setTitle(title)
                            .setURL(CURIOSA_CARD_URL + slug)
                            .setThumbnail(image)
                            .setDescription(`No price info for ${match.cardName}.`)
                            .setColor(Color.FAIL);
                    } else {
                        return new EmbedBuilder()
                            .setTitle(title)
                            .setURL(CURIOSA_CARD_URL + slug)
                            .setThumbnail(image)
                            .setDescription('*TCGPlayer.com - Lowest Listing Price*\n' + description)
                            .setColor(accentColor(card.elements));
                    }
                } else if (match.queryCode === QueryCode.IMAGE) {
                    return new EmbedBuilder()
                        .setURL(CURIOSA_CARD_URL + slug)
                        .setColor(accentColor(card.elements))
                        .setTitle(match.cardName)
                        .setImage(image);
                } else {

                    const title = match.cardName + '  ' + 
                        costEmoji(card.manaCost) + 
                        thresholdText(card.threshold);

                    // subtypes here is only displaying if there is a single one.
                    // This only currently impacts Azuridge Caravan, which in the 
                    // database has all available minion subtypes
                    const description = 
                        '**' + startCase(card.category) + 
                            (card.types.length > 0 ? ' — ' + card.types.map(s => startCase(s)).join(' ') : '') + 
                            (card.subtypes.length === 1 ? ' — ' + startCase(card.subtypes[0]) : '') + '**\n' +
                        (card.power ? 'Power ' + card.power + '\n' : '') +
                        replaceManaSymbols(card.rulesText) +  '\n' +
                        (card.flavorText !== '' ? '*' + card.flavorText + '*' : '');

                    return new EmbedBuilder()
                        .setURL(CURIOSA_CARD_URL + slug)
                        .setColor(accentColor(card.elements))
                        .setTitle(title)
                        .setDescription(description)
                        .setThumbnail(image);
                }
            }
        }
    });

    // wait for all promises to resolve then send
    Promise.all(embedPromises)
        .then(embeds => {
            if (embeds.length > 0)
                msg.channel.send({ embeds: embeds });
        });
});