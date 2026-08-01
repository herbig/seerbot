import { generalErrorEmbed, getQueryHelpMessage, noQueryEmbed, noSuchCardEmbed, defaultEmbed, imageEmbed, pricesEmbed, rulingsEmbed } from './embeds.js';
import { isHelpQuery, matchEmbed } from './query_embeds.js';
import { ApplicationCommandType } from 'discord.js';

const OPTION_NAME = 'cardname';

// Discord only allows 10 embeds per message, and an interaction can only be
// replied to once, so a message with more queries than this is truncated
const MAX_EMBEDS = 10;

const OPTION = {
      type: 3,
      name: OPTION_NAME,
      description: 'The name of the Sorcery card.',
      required: true,
};

const Command = Object.freeze({
    HELP: 'help',
    INFO: 'info',
    IMAGE: 'img',
    FAQ: 'faq',
    PRICE: 'price',

    // a message context menu command, so it's title case with a space
    MESSAGE_LOOKUP: 'Card Lookup',
});

export const COMMANDS = [
    {
        name: Command.HELP,
        description: 'Replies with a description of Four Cores bot features.',
    },
    {
        name: Command.INFO,
        description: 'Replies with general card details.',
        options: [OPTION],
    },
    {
        name: Command.IMAGE,
        description: 'Replies with a large card image.',
        options: [OPTION],
    },
    {
        name: Command.FAQ,
        description: 'Replies with card FAQs.',
        options: [OPTION],
    },
    {
        name: Command.PRICE,
        description: 'Replies with card prices.',
        options: [OPTION],
    },
    {
        // message commands take no description and no options, the message
        // they're used on is provided as interaction.targetMessage
        name: Command.MESSAGE_LOOKUP,
        type: ApplicationCommandType.Message,
    },
];

export function commandHandler(fuzzySearch, queryMatcher, api, analytics) {
    return async interaction => {
        if (interaction.isMessageContextMenuCommand()) {
            return messageLookupHandler(interaction, queryMatcher, api, analytics);
        }

        if (!interaction.isChatInputCommand()) return;

        const commandName = interaction.commandName;
        const query = interaction.options.getString(OPTION_NAME);
        const isPublicMessage = interaction.guild !== null;

        analytics.logCommand(commandName, { query: query, ephemeral: isPublicMessage });

        if (commandName === Command.HELP) {
            interaction.reply({ content: await getQueryHelpMessage(api), ephemeral: isPublicMessage });
            return;
        }

        const cardName = fuzzySearch.search(query);

        let embed;

        if (cardName === undefined) {
            embed = noSuchCardEmbed(query);
        } else {
            const cards = await api.getCards(cardName, undefined, commandName === Command.PRICE);

            if (!cards) {
                // unknown api error
                embed = generalErrorEmbed();
                analytics.logError('api error during command ' + commandName);
            } else {
                switch(commandName) {
                    case Command.FAQ:
                        embed = await rulingsEmbed(cards[0], api);
                        break;
                    case Command.PRICE:
                        embed = pricesEmbed(cards);
                        break;
                    case Command.IMAGE:
                        embed = imageEmbed(cards[0]);
                        break;
                    default:
                        embed = defaultEmbed(cards[0]);
                        break;
                }
            }
        }
        interaction.reply({ embeds: [embed], ephemeral: isPublicMessage });
    };
}

/**
 * Handles the "Card Lookup" message context menu command, which scans the
 * message it was used on for ((card name)) queries and replies with the same
 * embeds an inline query would produce.
 *
 * Discord sends the full content of that message without the Message Content
 * intent, so this covers looking up queries in messages that don't mention
 * the app.
 */
async function messageLookupHandler(interaction, queryMatcher, api, analytics) {

    const content = interaction.targetMessage.content;
    const isPublicMessage = interaction.guild !== null;

    analytics.logCommand(Command.MESSAGE_LOOKUP, { query: content, ephemeral: isPublicMessage });

    // a lookup can fan out into several API calls, so buy more than the
    // three seconds an immediate interaction reply allows
    await interaction.deferReply({ ephemeral: isPublicMessage });

    // detect ((help)) query and respond with the help message
    // this will ignore other card queries and only respond with help
    if (isHelpQuery(content)) {
        interaction.editReply({ content: await getQueryHelpMessage(api) });
        analytics.logHelp();
        return;
    }

    const matches = queryMatcher.getMatches(content).slice(0, MAX_EMBEDS);

    if (matches.length === 0) {
        interaction.editReply({ embeds: [noQueryEmbed()] });
        return;
    }

    const embeds = await Promise.all(matches.map(match => {
        analytics.logQuery(match);
        return matchEmbed(match, api);
    }));

    interaction.editReply({ embeds: embeds });
}