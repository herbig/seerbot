import { Client, Events, GatewayIntentBits } from 'discord.js';

export class DiscordBot {

    #client;

    constructor(botToken) {
        this.#client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ]
        });
        this.#client.login(botToken);
    }

    onReady(callback) { this.#client.on(Events.ClientReady, callback); }

    onNewMessage(callback) { this.#client.on(Events.MessageCreate, callback); }

    setActivityStatus(activity) { this.#client.user.setActivity(activity); }
}