/**
 * One-off: pushes resources/avatar.png to Discord as the bot's avatar.
 *
 * The avatar is account state held by Discord, not something the bot reads at
 * boot — so replacing resources/avatar.png and redeploying changes nothing on
 * its own. This has to be run explicitly.
 *
 * There are two Discord applications, the live bot and a dev one, and they are
 * told apart only by which BOT_TOKEN is in the environment. A local `.env`
 * holds the *dev* token, so running this on a laptop updates the dev bot — an
 * easy and completely silent mistake. Hence: it reports which bot it resolved
 * to and changes nothing unless you pass --yes.
 *
 *   npm run set-avatar              # dry run, just names the target
 *   npm run set-avatar -- --yes     # actually applies it
 *
 * To hit the live bot, run it on the dyno so the production config vars supply
 * the token, rather than copying that token anywhere:
 *
 *   heroku run npm run set-avatar -- --yes --app <app>
 *
 * Deliberately not wired into startup: Discord rate-limits avatar changes, so a
 * crash-looping dyno would throttle itself, and every deploy would spend a
 * request rewriting an unchanged value.
 */
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { Client, Events } from 'discord.js';

const apply = process.argv.includes('--yes');

const token = process.env.BOT_TOKEN;
if (!token) {
    console.error('BOT_TOKEN is not set. Add it to .env for the dev bot, or use `heroku run` so the live config vars supply it.');
    process.exit(1);
}

const client = new Client({ intents: [] });

client.once(Events.ClientReady, async () => {
    try {
        console.log(`Bot:      ${client.user.tag} (${client.user.id})`);
        console.log(`NODE_ENV: ${process.env.NODE_ENV ?? '(unset)'}`);

        if (!apply) {
            console.log('\nDry run — nothing changed. Check the bot above is the one you meant, then re-run with --yes.');
            return;
        }

        const avatar = await readFile(new URL('./resources/avatar.png', import.meta.url));
        await client.user.setAvatar(avatar);
        console.log('\nAvatar updated.');
    } catch (error) {
        console.error(`Could not set the avatar: ${error.message}`);
        process.exitCode = 1;
    } finally {
        await client.destroy();
    }
});

client.login(token);
