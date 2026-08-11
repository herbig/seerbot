/**
 * One-off: pushes resources/avatar.png to Discord as the bot's avatar.
 *
 * The avatar is account state held by Discord, not something the bot reads at
 * boot — so replacing resources/avatar.png and redeploying changes nothing on
 * its own. Run this once after the image changes:
 *
 *   npm run set-avatar
 *
 * Deliberately not wired into startup. Discord rate-limits avatar changes
 * (a couple per hour), so a bot that re-uploaded on every boot would get itself
 * throttled the first time a dyno crash-looped — and would spend a request on
 * every deploy to write a value that hadn't changed.
 */
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { Client, Events } from 'discord.js';

const token = process.env.BOT_TOKEN;
if (!token) {
    console.error('BOT_TOKEN is not set. Add it to .env (locally) or run this against the Heroku config var.');
    process.exit(1);
}

const client = new Client({ intents: [] });

client.once(Events.ClientReady, async () => {
    try {
        const avatar = await readFile(new URL('./resources/avatar.png', import.meta.url));
        await client.user.setAvatar(avatar);
        console.log(`Avatar updated for ${client.user.tag}.`);
    } catch (error) {
        console.error(`Could not set the avatar: ${error.message}`);
        process.exitCode = 1;
    } finally {
        await client.destroy();
    }
});

client.login(token);
