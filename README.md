# Horstrivia

Bad translation based trivia game over Telegram. Questions from the [Open Trivia Database](https://opentdb.com/).

## Configuration

Two JSON config files need to be created under `./config` before the bot can function. Example config files can be found at `./config-example`

### telegram.json

`BOT_TOKEN` - Telegram bot API token

`ALLOWED_CHATS` - Array of chat id's the bot will respond to

### translate.json

`TRANSLATE_API_URL` - The translating API should accept requests with body `{ text: 'translate this }`, and return body of the translated text

`SEPARATOR` - Character or string that will be separating array elements when translating - should be something the translating API will not interfere with

