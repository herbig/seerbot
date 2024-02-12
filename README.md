# SeerBot
A Discord bot similar to the MTG Scryfall bot, to quickly get Sorcery TCG card details in Discord.

The bot scans new messages for the pattern `{{CARD NAME}}` and responds with details about the card, if the name is a valid Sorcery card.

For local dev, to get set up run:

`npm install`

Then

`npm run devStart`

You will need to have set up a Discord bot in their developer portal with the *Message Content Intent* permission, as well as the following values in your local `.env` file:

```
BOT_TOKEN={Discord bot token}
IMG_URL='https://curiosa.io/_next/image?w=750&q=75&url=https%3A%2F%2Fd27a44hjr9gen3.cloudfront.net%2Fbet%2F'
CURIOSA_URL='https://curiosa.io/cards/'
```

### TODO
- price lookup (TCGPlayer no longer giving API access...)
- alternate art / promos? look at what Scryfall does
- rulings (need Curiosa API probably)