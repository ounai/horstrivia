'use strict';

const TelegramBot = require('node-telegram-bot-api');

const telegramConfig = require('../config/telegram.json');

const bot = new TelegramBot(telegramConfig.BOT_TOKEN, { polling: true });

bot.onText(/^\/start/, (msg, match) => {
  console.log(msg);
});

bot.on('polling_error', err => {
  console.error(err);
});

module.exports = () => {
  return new Promise((resolve, reject) => {
    bot.getMe().then(resolve).catch(reject);
  });
};

