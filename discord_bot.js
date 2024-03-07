import { REST, Routes, Client, Events, GatewayIntentBits } from 'discord.js';

/**
 * A light wrapper that manages interactions with Discord.
 */
export class DiscordBot {

    #client;

    constructor(analytics, botToken, clientId, commands, commandHandler) {
        this.#client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ]
        });
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