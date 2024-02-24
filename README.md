# SeerBot
A Discord bot inspired by [MTG Scryfall](https://scryfall.com/docs/discord-bot), to quickly get [Sorcery TCG](https://sorcerytcg.com/) card details in Discord.

The bot scans new messages for the pattern `{{CARD NAME}}` and responds with details about the card, if the name is a valid Sorcery card.

For local dev, to get set up run:

`npm install`

Then

`npm run devStart`

You will need to have set up a Discord bot in their developer portal with the *Message Content Intent* permission, as well as the following values in your local `.env` file:

```
BOT_TOKEN={Discord bot token}
IMG_URL_BASE=''
CURIOSA_URL='https://curiosa.io/cards/'
```

### TODO
- price lookup (TCGPlayer no longer giving API access...)