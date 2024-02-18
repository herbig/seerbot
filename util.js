import removeAccents from 'remove-accents';

/**
 * Normalize the card name to the same identifier that curiosa.io uses.
 */
export function cardSlug(name) {
    return removeAccents(name)
        .toLowerCase()
        .replace(/[\s\-]+/g, '_') // Replace spaces or dashes with underscores
        .replace(/[^a-zA-Z_]/g, ''); // Remove non-alphabetic characters (except for underscores)
}

/**
 * Sets an interval to randomly update the Discord activity status of the bot.
 */
export function randomizeActivity(discordClient) {

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
        discordClient.user.setActivity(activities[Math.floor(Math.random() * activities.length)]);
    };

    setRandom();

    setInterval(() => {
        setRandom();
    }, 600_000); // 10 minute interval
}