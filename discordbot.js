import { Client, Events, GatewayIntentBits } from 'discord.js';

/**
 * A light wrapper that manages interactions with Discord.
 */
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

/**
 * Sets an interval to randomly update the Discord activity status of the bot.
 */
export function randomizeActivity(discord) {

    const activities = [
        "for ante",
        "Grey Wolves",
        "Wicker Manikin",
        "at Death's Door",
        "Deathspeaker",
        "four Cores",
        "Muck Lampreys",
        "Grapple Shot",
    ];

    function setRandom() {
        discord.setActivityStatus(activities[Math.floor(Math.random() * activities.length)]);
    };

    setRandom();

    setInterval(() => {
        setRandom();
    }, 600_000); // 10 minute interval
}