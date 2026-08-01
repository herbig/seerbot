import { REST, Routes, Client, Events, GatewayIntentBits } from 'discord.js';
import { hasMessageContentIntent } from './util.js';

/**
 * A light wrapper that manages interactions with Discord.
 */
export class DiscordBot {

    #client;

    constructor(analytics, botToken, clientId, commands, commandHandler) {
        const intents = [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
        ];

        // Only ask for the privileged intent when the developer portal has
        // actually granted it.  Requesting an intent we don't have doesn't
        // degrade the bot, it closes the gateway with 4014 "Disallowed
        // intent(s)" and the bot never connects at all.
        // https://docs.discord.com/developers/events/gateway#message-content-intent
        if (hasMessageContentIntent()) {
            intents.push(GatewayIntentBits.MessageContent);
        }

        this.#client = new Client({ intents: intents });
        this.#client.login(botToken);

        // set up slash commands
        (async () => {
            try {
                // we generally don't need to register commands every time the
                // app is started, so just using a simple env var to register once
                // then not again
                if (process.env.REGISTER_COMMANDS === 'true') {
                    const rest = new REST({ version: '9' }).setToken(botToken);
                    await rest.put(Routes.applicationCommands(clientId), { body: commands });
                }
                this.#client.on(Events.InteractionCreate, commandHandler);
            } catch (error) {
                analytics.logError('slash commands setup failed', error);
            }
        })();
    }

    onReady(callback) { this.#client.on(Events.ClientReady, callback); }

    onNewMessage(callback) { this.#client.on(Events.MessageCreate, callback); }

    setActivityStatus(activity) { this.#client.user.setActivity(activity); }
}