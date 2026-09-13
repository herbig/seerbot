# Four Cores Discord Bot
A Discord bot inspired by [MTG Scryfall](https://scryfall.com/docs/discord-bot), to quickly get [Sorcery TCG](https://sorcerytcg.com/) card details in Discord.

The bot scans new messages for the pattern `((CARD NAME))` and responds with details about the card, if the text is a valid Sorcery card name. The rules text shown is the card's **current official wording** (errata included), as served by the fourcores.gg API's `/v2/cards`; what a given printing physically printed is available on the lookup result as `printedRulesText` but not displayed.

To add the bot to a discord server you administer use [this join link](https://fourcores.gg/bot)

## Dev setup
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
# prevent analytics from firing in dev
NODE_ENV='dev'
# Discord id of the app's maintainer (me)
DEV_DISCORD_ID={discord id}
# whether to register slash commands on startup
REGISTER_COMMANDS=true
# key for the fourcores.gg API (the `seerbot` key — see below)
FOURCORES_API_KEY={api key}
```

## API key

The fourcores.gg API rejects any request without an `X-API-Key` header, so the
bot does nothing useful without `FOURCORES_API_KEY` — every lookup 401s and
comes back empty, which looks a lot like the API being down. It is logged as an
error on startup for that reason.

seerbot has its own key, separate from the web app's, so either can be rotated
or revoked without taking the other down. Keys are configured on the API side as
`name:secret` pairs in its `SORCERY_API_KEYS` config var; seerbot's is the one
named `seerbot`. Unlike the web app's key — which ships inside a public JS
bundle and is not a secret — this one only ever lives in the bot's environment,
so treat it as a real secret: set it in the Heroku config vars, never in the
repo.

## Two bots

There are two Discord applications sharing this codebase — the live bot and a dev one — and **nothing in the repo distinguishes them.**  The only difference is which `BOT_TOKEN` is in the environment, so the same commands hit different bots depending on where they run:

| | Application id | Token comes from |
| --- | --- | --- |
| Live | `1205311766280544346` | Heroku config vars |
| Dev | `1205910927728451604` | your local `.env` |

The live id is the one in the invite link the site hands out (`fourcores.gg/bot`).  Anything run on a laptop is talking to the **dev** bot unless you have deliberately arranged otherwise.

## Avatar
`resources/avatar.png` is the bot's avatar.  Nothing reads it at runtime — the avatar is account state held by Discord, so replacing the file and redeploying changes nothing on its own.  After changing the image, push it explicitly:

```
npm run set-avatar              # dry run: names the bot it resolved to, changes nothing
npm run set-avatar -- --yes     # applies it
```

It always prints the bot's tag and id first, because updating the wrong one of the two applications above is otherwise completely silent.  To hit the **live** bot, run it on the dyno so the production config vars supply the token, rather than copying that token anywhere:

```
heroku run npm run set-avatar -- --yes --app <app>
```

It is deliberately a one-off rather than something startup does, because Discord rate-limits avatar changes and a crash-looping dyno would throttle itself.

The image is generated from the app icon master in the `fourcores-homepage` repo (`assets/icon/icon.svg`, via `npm run icons`), so it stays in step with the app and store icons rather than drifting as its own copy.

## Emoji
Mana and threshold emoji are provided under `resources/emoji`, and `resources/emoji_adjusted`, the adjusted version having bottom padding to properly baseline align them within a Discord embed.  These are already hosted on the FourCores Discord, and should appear.  To host them yourself, add them to your Discord server and update the `ElementEmoji` and `ManaCostEmoji` fields with their ids.
