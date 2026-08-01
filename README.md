# Four Cores Discord Bot
A Discord bot inspired by [MTG Scryfall](https://scryfall.com/docs/discord-bot), to quickly get [Sorcery TCG](https://sorcerytcg.com/) card details in Discord.

The bot scans messages for the pattern `((CARD NAME))` and responds with details about the card, if the text is a valid Sorcery card name. A message is scanned when it mentions the bot, or when someone runs the *Card Lookup* message context menu command on it (right click a message, or long press on mobile, then pick *Apps → Card Lookup*). Individual cards can also be looked up by name with the `/info`, `/img`, `/faq` and `/price` slash commands.

To add the bot to a discord server you administer use [this join link](https://fourcores.xyz/bot)

## Privileged intents
The bot runs with **no [privileged intents](https://docs.discord.com/developers/gateway#privileged-intents)** by default, and never requires one.

Discord sends message content without the *Message Content* intent when the app is mentioned, and for the message a [message context menu command](https://docs.discord.com/developers/interactions/application-commands#message-commands) is used on, so those two paths carry card lookup on their own.

Setting `MESSAGE_CONTENT_INTENT=true` additionally requests the intent, which restores passively scanning every visible message for `((card name))`. Only turn it on if the developer portal actually grants it — **requesting an intent the app doesn't have closes the gateway with [4014 `Disallowed intent(s)`](https://docs.discord.com/developers/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes) and the bot won't connect at all.** The portal grants it freely below 10,000 users; above that it needs [review](https://docs.discord.com/developers/gateway/getting-started-with-privileged-intent-review), which passive scanning is unlikely to pass, since Discord treats the context menu command as the supported alternative.

## Dev setup
For local dev run:

`npm run devStart`

You will need to have set up a Discord bot in the Discord developer portal, with no privileged intents enabled, as well as the following values in your local `.env` file:

```
# Sentry DSN, for analytics
SENTRY_DSN={Sentry DSN}
# your Discord bot token
BOT_TOKEN={Discord bot token}
# your Discord bot's id
BOT_CLIENT_ID={Discord bot id}
# prevent analytics from firing in dev
NODE_ENV='dev'
# Discord id of the app's maintainer (me)
DEV_DISCORD_ID={discord id}
# whether to register slash commands on startup
REGISTER_COMMANDS=true
# whether to request the Message Content privileged intent, see above.
# omit or set to anything but 'true' to run without it
MESSAGE_CONTENT_INTENT=false
```

Commands are only registered with Discord when `REGISTER_COMMANDS` is `true`, so it needs to be set for one startup after any change to `COMMANDS` in [slash_commands.js](slash_commands.js).

## Emoji
Mana and threshold emoji are provided under `resources/emoji`, and `resources/emoji_adjusted`, the adjusted version having bottom padding to properly baseline align them within a Discord embed.  These are already hosted on the FourCores Discord, and should appear.  To host them yourself, add them to your Discord server and update the `ElementEmoji` and `ManaCostEmoji` fields with their ids.
