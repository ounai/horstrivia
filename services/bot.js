'use strict';

const TelegramBot = require('node-telegram-bot-api');

const triviaService = require('./trivia');
const dbService = require('./db');

const telegramConfig = require('../config/telegram.json');

const bot = new TelegramBot(telegramConfig.BOT_TOKEN, { polling: true });

function handleError(err) {
  console.error(err);
}

function getQuestionHTML(question) {
  let html = `<strong>${question.question}</strong>`;

  /*
  html += '\n\n';
  html += `Difficulty: <em>${question.difficulty}</em>`;
  */

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

  let incorrect = 2;

  const addKey = (text, isCorrect) => {
    keyboard.push([{
      text,
      callback_data: (isCorrect ? '1' : '' + (incorrect++))
    }]);
  };

  addKey(question.correct_answer, true);
  question.incorrect_answers.forEach(answer => addKey(answer, false));

  shuffleArray(keyboard);

  return keyboard;
}

function sendQuestion(chatId, question) {
  const html = getQuestionHTML(question);
  const keyboard = getInlineKeyboard(question);

  bot.sendMessage(chatId, html, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: keyboard
    }
  })
    .then(msg => dbService.addTriviaMessage(chatId, msg.message_id, html, keyboard, question.correct_answer));
}

function getAnswersHTML(triviaMessage) {
  const correctEmoji = '✔️';
  const incorrectEmoji = '❌';

  let html = '';

  triviaMessage.answers.forEach(answer => {
    html += (answer.correct ? correctEmoji : incorrectEmoji);
    html += ' <strong>' + answer.name + '</strong>';
    html += '\n';
  });

  return html;
}

function updateQuestion(messageId, triviaMessage) {
  bot.editMessageText(triviaMessage.html + '\n\n' + getAnswersHTML(triviaMessage), {
    chat_id: triviaMessage.chatId,
    message_id: messageId,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: triviaMessage.keyboard
    }
  });
}

function addAnswer(callbackQueryId, messageId, answerer, isAnswerCorrect) {
  const answerCounted = dbService.addTriviaMessageAnswer(messageId, {
    name: answerer.first_name,
    id: answerer.id
  }, isAnswerCorrect);

  if (!answerCounted) {
    bot.answerCallbackQuery(callbackQueryId, {
      text: 'Oot jo vastannu!'
    });

    return;
  }

  const triviaMessage = dbService.getTriviaMessage(messageId);

  if (isAnswerCorrect) {
    bot.answerCallbackQuery(callbackQueryId, {
      text: 'Jes!'
    });
  } else {
    bot.answerCallbackQuery(callbackQueryId, {
      text: 'Eipä ollu, oikea vastaus:\n' + triviaMessage.correctAnswer,
      show_alert: true
    });
  }

  updateQuestion(messageId, triviaMessage);
}

function isAllowed(chatId) {
  return telegramConfig.ALLOWED_CHATS.indexOf(chatId) !== -1;
}

bot.onText(/^\/start/, msg => {
  if (!isAllowed(msg.chat.id)) return;

  console.log(msg);
});

bot.onText(/^\/trivia/, msg => {
  if (!isAllowed(msg.chat.id)) return;

  triviaService.getQuestion()
    .then(triviaService.translateQuestion)
    .then(translatedQuestion => sendQuestion(msg.chat.id, translatedQuestion))
    .catch(handleError);
});

bot.onText(/^\/scoreboard/, msg => {
  if (!isAllowed(msg.chat.id)) return;

  const scoreboard = dbService.getScoreboard();

  let html = '';

  scoreboard.forEach(score => {
    html += `<strong>${score.name}</strong>: ${score.score}\n`;
  });

  bot.sendMessage(msg.chat.id, html, {
    parse_mode: 'HTML'
  });
});

bot.on('callback_query', callbackQuery => {
  const messageId = callbackQuery.message.message_id;
  const answerer = callbackQuery.from;
  const isAnswerCorrect = (callbackQuery.data === '1');

  addAnswer(callbackQuery.id, messageId, answerer, isAnswerCorrect);
});

bot.on('polling_error', handleError);

module.exports = async () => {
  return await bot.getMe();
};

