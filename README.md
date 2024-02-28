# SeerBot
A Discord bot inspired by [MTG Scryfall](https://scryfall.com/docs/discord-bot), to quickly get [Sorcery TCG](https://sorcerytcg.com/) card details in Discord.

The bot scans new messages for the pattern `{{CARD NAME}}` and responds with details about the card, if the name is a valid Sorcery card.

For local dev, to get set up run:

`npm install`

Then

`npm run devStart`

You will need to have set up a Discord bot in their developer portal with the *Message Content Intent* permission, as well as the following values in your local `.env` file:

```
# your Discord bot token
BOT_TOKEN={Discord bot token}
# base URL for hosted card images
IMG_URL_BASE='https://sorcery-api.s3.amazonaws.com/'
```

# Emoji
Mana and threshold emoji are provided under `resources/emoji`, and `resources/emoji_adjusted`, the adjusted version having bottom padding to properly baseline align them within a Discord embed.  These are already hosted, and should appear.  To host them yourself, add them to your Discord server and update the `ElementEmoji` and `ManaCostEmoji` fields with their ids.

# Adding new cards
When new sets are printed, the following steps will need to be taken:

- update the backing API with the cards and their data
- update `card_list.txt` with any new card names
- add the card images to both slug-based and id based S3 buckets (or whatever image hosting is used), with a `{id}_hor` (horizontal) postfix for id based Site cards.
- update `replaceManaSymbols` if additional mana amounts appear on the new card's text
- update `getHelpMessage`, `SetName` with the new set codes