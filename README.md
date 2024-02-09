# SeerBot
A Discord bot similar to MTG's Scryfall bot, to quickly get Sorcery TCG card details in Discord.

The bot scans new messages for the pattern `[[CARD_NAME]]`, and responds with details about the card, if the name is a valid Sorcery card.

For local dev to get set up run:

`npm install`

Then

`npm run devStart`

You will need to set up a Discord bot in their developer portal with `Server Members Intent` and `Message Content Intent` permissions, as well as the following values in your local `.env` file:

`BOT_TOKEN={Discord bot token}`
`SORC_ENDPOINT='https://api.sorcerytcg.com/api/cards'`
`SORC_KEY={Sorcery api key}`
