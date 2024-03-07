import { generalErrorEmbed, getQueryHelpMessage, noSuchCardEmbed, defaultEmbed, imageEmbed, pricesEmbed, rulingsEmbed } from './embeds.js';

const OPTION_NAME = 'cardname';

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
});

export const COMMANDS = [
    {
        name: Command.HELP,
        description: 'Replies with a description of SeerBot features.',
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
];

export function commandHandler(fuzzySearch, api, cardRulings, analytics) {
    return async interaction => {
        if (!interaction.isCommand()) return;

        const commandName = interaction.commandName;
        const query = interaction.options.getString(OPTION_NAME);
        const isPublicMessage = interaction.guild !== null;

        analytics.logCommand(commandName, { query: query, ephemeral: isPublicMessage });

        if (commandName === Command.HELP) {
            interaction.reply({ content: getQueryHelpMessage(), ephemeral: isPublicMessage });
            return;
        }

        const cardName = fuzzySearch.search(query);

        let embed;

        if (cardName === undefined) {
            embed = noSuchCardEmbed(query);
        } else {
            const cards = await api.getCards(cardName);

            if (!cards) {
                // unknown api error
                embed = generalErrorEmbed();
                analytics.logError('api error during command ' + commandName);
            } else {
                switch(commandName) {
                    case Command.FAQ:
                        embed = rulingsEmbed(cards[0], cardRulings);
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