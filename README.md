# Four Cores Discord Bot
A Discord bot inspired by [MTG Scryfall](https://scryfall.com/docs/discord-bot), to quickly get [Sorcery TCG](https://sorcerytcg.com/) card details in Discord.

The bot scans new messages for the pattern `((CARD NAME))` and responds with details about the card, if the text is a valid Sorcery card name.

For local dev run:

`npm run devStart`

You will need to have set up a Discord bot in the Discord developer portal with the *Message Content Intent* permission, as well as the following values in your local `.env` file:

```
# Sentry DSN, for analytics
SENTRY_DSN={Sentry DSN}
# your Discord bot token
BOT_TOKEN={Discord bot token}
# your Discord bot's id
BOT_CLIENT_ID={Discord bot id}
# base URL for hosted card images
IMG_URL_BASE='https://fourcores-images.netlify.app/.netlify/images?url=/cards/'
# prevent analytics from firing in dev
NODE_ENV='dev'
# Discord id of the app's maintainer (me)
DEV_DISCORD_ID={discord id}
# whether to register slash commands on startup
REGISTER_COMMANDS=true
```

# Emoji
Mana and threshold emoji are provided under `resources/emoji`, and `resources/emoji_adjusted`, the adjusted version having bottom padding to properly baseline align them within a Discord embed.  These are already hosted on the FourCores Discord, and should appear.  To host them yourself, add them to your Discord server and update the `ElementEmoji` and `ManaCostEmoji` fields with their ids.
