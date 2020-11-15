'use strict';

const TelegramBot = require('node-telegram-bot-api');
const he = require('he');

const triviaService = require('./trivia.js');
const translateService = require('./translate.js');

const telegramConfig = require('../config/telegram.json');

const bot = new TelegramBot(telegramConfig.BOT_TOKEN, { polling: true });

function handleError(err) {
  console.error(err);
}

function sendMultipleChoice(chatId, question) {
  bot.sendMessage(chatId, JSON.stringify(question));
}

function sendTrueFalse(chatId, question) {
  bot.sendMessage(chatId, JSON.stringify(question));
}

function sendQuestion(chatId, encodedQuestion) {
  const question = he.decode(encodedQuestion.question);

  const answers = [ he.decode(encodedQuestion.correct_answer) ];
  encodedQuestion.incorrect_answers.forEach(answer => answers.push(he.decode(answer)));

  translateService.translateArray([question, ...answers])
    .then(data => {
      const translatedQuestion = {
        ...encodedQuestion,
        question: data[0],
        correct_answer: data[1],
        incorrect_answers: data.splice(2)
      };

      if (translatedQuestion.type === 'multiple') sendMultipleChoice(chatId, translatedQuestion);
      else if (translatedQuestion.type === 'boolean') sendTrueFalse(chatId, translatedQuestion);
      else handleError(`Unknown question type ${translatedQuestion.type}`);
    })
    .catch(handleError);
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

