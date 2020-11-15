'use strict';

const TelegramBot = require('node-telegram-bot-api');

const triviaService = require('./trivia.js');

const telegramConfig = require('../config/telegram.json');

const bot = new TelegramBot(telegramConfig.BOT_TOKEN, { polling: true });

function handleError(err) {
  console.error(err);
}

function sendQuestion(chatId, question) {
  bot.sendMessage(chatId, JSON.stringify(question));
}

bot.onText(/^\/start/, (msg, match) => {
  console.log(msg);
});

bot.onText(/^\/trivia/, (msg, match) => {
  triviaService.getQuestion()
    .then(triviaService.translateQuestion)
    .then(translatedQuestion => sendQuestion(msg.chat.id, translatedQuestion))
    .catch(handleError);
});

bot.on('polling_error', handleError);

module.exports = () => {
  return new Promise((resolve, reject) => {
    bot.getMe()
      .then(resolve)
      .catch(reject);
  });
};

