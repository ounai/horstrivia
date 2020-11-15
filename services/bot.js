'use strict';

const TelegramBot = require('node-telegram-bot-api');
const he = require('he');

const triviaService = require('./trivia.js');

const telegramConfig = require('../config/telegram.json');

const bot = new TelegramBot(telegramConfig.BOT_TOKEN, { polling: true });

function sendQuestion(chatId, encodedQuestion) {
  const question = he.decode(encodedQuestion.question);

  bot.sendMessage(chatId, question);
}

function handleError(err) {
  console.error(err);
}

bot.onText(/^\/start/, (msg, match) => {
  console.log(msg);
});

bot.onText(/^\/trivia/, (msg, match) => {
  triviaService.getQuestion()
    .then(question => sendQuestion(msg.chat.id, question))
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

