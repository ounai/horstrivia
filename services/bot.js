'use strict';

const TelegramBot = require('node-telegram-bot-api');

const triviaService = require('./trivia.js');

const telegramConfig = require('../config/telegram.json');

const bot = new TelegramBot(telegramConfig.BOT_TOKEN, { polling: true });

function handleError(err) {
  console.error(err);
}

function getQuestionHTML(question) {
  let html = `<strong>${question.question}</strong>`;
  html += '\n\n';
  //html += `Difficulty: <em>${question.difficulty}</em>`;

  return html;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getInlineKeyboard(question) {
  let keyboard = [];

  const addKey = (text, isCorrect) => {
    keyboard.push([{
      text,
      callback_data: (isCorrect ? '1' : '0')
    }]);
  };
  
  addKey(question.correct_answer, true);
  question.incorrect_answers.forEach(answer => addKey(answer, false));

  shuffleArray(keyboard);

  return keyboard;
}

function sendQuestion(chatId, question) {
  bot.sendMessage(chatId, getQuestionHTML(question), {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: getInlineKeyboard(question)
    }
  });
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

